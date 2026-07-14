// Search-index generation for the docs. Parses raw page.mdx sources into
// per-page fragments ({ route, sections }) under .search-index/ and merges
// them into public/search-index*.json (gitignored, fetched lazily by the
// search dialog; content-hashed name in prod builds). Two entry points share
// this module: seedSearchIndex() (next.config.ts, mtime-checked full scan so
// dev/build always start with a complete index) and
// loaders/search-index-loader.mjs (per-page refresh on recompile). Titles/
// descriptions are NOT emitted — the client joins on route against NAV,
// which its bundle already carries.
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = fileURLToPath(new URL("..", import.meta.url));
const appDir = path.join(docsRoot, "src", "app");
const fragmentsDir = path.join(docsRoot, ".search-index");
const publicDir = path.join(docsRoot, "public");
const INDEX_FILE_RE = /^search-index(\.[0-9a-f]{10})?\.json$/;

// Mirrors slugify + createIdChain in satteri/hast-plugins.mjs so section ids
// match the rendered heading anchors exactly.
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function createIdChain() {
  const stack = []; // slug per depth, h2 at index 0
  return (depth, slug) => {
    const i = Math.max(0, depth - 2);
    stack.length = i;
    stack[i] = slug;
    return stack.filter(Boolean).join("-");
  };
}

// Markdown inline syntax → plain text (links/images keep their label, inline
// code keeps its content, emphasis markers drop).
function cleanInline(text) {
  return text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*|__|(?<![\w*])\*(?!\s)|(?<!\s)\*(?![\w*])/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Net JSX tag depth of a line: openings minus self-closes and closing tags.
// `</x>` doesn't double-count as an opening (second char is `/`, not a letter).
function jsxDelta(line) {
  const opens = (line.match(/<[A-Za-z]/g) ?? []).length;
  const selfCloses = (line.match(/\/>/g) ?? []).length;
  const closes = (line.match(/<\//g) ?? []).length;
  return opens - selfCloses - closes;
}

/**
 * Raw page.mdx source → { route, sections: [{ id, heading, text }] }.
 * Section 0 is the pre-first-heading intro (id/heading empty); frontmatter,
 * import/export statements, JSX blocks, code fences, and mdx comments are
 * dropped; table cells and blockquote prose are kept as text.
 */
export function extractSearchDoc(source, route) {
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const chain = createIdChain();
  const sections = [{ id: "", heading: "", text: [] }];
  let inFence = false;
  let inStatement = false;
  let jsxDepth = 0;

  for (const raw of body.split("\n")) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (inStatement) {
      if (/;\s*$|from\s+["'][^"']+["'];?\s*$/.test(line)) inStatement = false;
      continue;
    }
    if (/^(import|export)\b/.test(line)) {
      if (!/;\s*$|from\s+["'][^"']+["'];?\s*$/.test(line)) inStatement = true;
      continue;
    }
    if (jsxDepth > 0) {
      jsxDepth = Math.max(0, jsxDepth + jsxDelta(line));
      continue;
    }
    if (line.startsWith("<")) {
      jsxDepth = Math.max(0, jsxDelta(line));
      continue;
    }

    const heading = /^(#{2,6})\s+(.+)/.exec(line);
    if (heading) {
      const depth = heading[1].length;
      const text = cleanInline(heading[2]);
      // Only h2/h3 get sections (matching the TOC); deeper headings stay prose.
      if (depth <= 3) {
        sections.push({ id: chain(depth, slugify(text)), heading: text, text: [] });
        continue;
      }
    }

    let prose = line.replace(/^>\s?/, "").replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/, "");
    if (prose.startsWith("|")) {
      if (/^[\s|:-]+$/.test(prose)) continue; // table separator row
      prose = prose.replace(/\|/g, " ");
    }
    prose = cleanInline(heading ? prose.replace(/^#+\s+/, "") : prose);
    if (prose) sections.at(-1).text.push(prose);
  }

  return {
    route,
    sections: sections
      .map((s) => ({ ...s, text: s.text.join(" ") }))
      .filter((s) => s.heading || s.text),
  };
}

// …/src/app/(docs)/components/buttons/page.mdx → /components/buttons
export function routeFromPath(resourcePath) {
  const rel = path.relative(appDir, resourcePath);
  const segs = rel.split(path.sep).filter((seg) => !seg.startsWith("("));
  segs.pop(); // page.mdx
  return `/${segs.join("/")}`;
}

const fragmentFile = (route) =>
  path.join(fragmentsDir, `${route.replace(/^\//, "").replace(/\//g, "-") || "index"}.json`);

// Rename-atomic write: readers (and the dev server) never see a partial file.
async function writeAtomic(file, data) {
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

// Merges are serialized within the process: concurrent loader runs would
// otherwise interleave reading fragments mid-write and racing the prune.
let mergeChain = Promise.resolve("");

// Merge all fragments into the public index and return its URL path. Prod
// builds get a content-hashed name (cache-friendly, stable within a build —
// sources can't change mid-build); dev keeps plain search-index.json so the
// client URL never moves while the loader re-merges. Either way the other
// style's leftovers are pruned so out/ ships exactly one index.
export function mergeSearchIndex() {
  mergeChain = mergeChain.catch(() => "").then(doMerge);
  return mergeChain;
}

async function doMerge() {
  const names = (await fs.readdir(fragmentsDir)).filter((f) => f.endsWith(".json"));
  const pages = (
    await Promise.all(
      names.map((f) =>
        fs
          .readFile(path.join(fragmentsDir, f), "utf8")
          .then(JSON.parse)
          // A fragment pruned/rewritten mid-read just drops from this merge;
          // the writer's own merge (queued behind us) picks it back up.
          .catch(() => null),
      ),
    )
  )
    .filter(Boolean)
    .toSorted((a, b) => a.route.localeCompare(b.route));
  const payload = JSON.stringify(pages);
  const fileName =
    process.env.NODE_ENV === "production"
      ? `search-index.${crypto.createHash("sha1").update(payload).digest("hex").slice(0, 10)}.json`
      : "search-index.json";
  await fs.mkdir(publicDir, { recursive: true });
  await Promise.all(
    (await fs.readdir(publicDir))
      .filter((existing) => existing !== fileName && INDEX_FILE_RE.test(existing))
      .map((stale) => fs.rm(path.join(publicDir, stale), { force: true })),
  );
  await writeAtomic(path.join(publicDir, fileName), payload);
  return `/${fileName}`;
}

// Loader entry: refresh one page's fragment from its (possibly unsaved)
// source and re-merge.
export async function updateSearchIndex(resourcePath, source) {
  await fs.mkdir(fragmentsDir, { recursive: true });
  const route = routeFromPath(resourcePath);
  await writeAtomic(fragmentFile(route), JSON.stringify(extractSearchDoc(source, route)));
  await mergeSearchIndex();
}

// Config-load entry: full scan with mtime checks (Turbopack caches loader
// results, so the loader alone can't guarantee a complete index on a fresh
// clone or after public/ is wiped). Prunes fragments of deleted pages.
// Always merges (cheap) and returns the index URL for the client bundle.
export async function seedSearchIndex() {
  await fs.mkdir(fragmentsDir, { recursive: true });
  const entries = await fs.readdir(appDir, { recursive: true, withFileTypes: true });
  const wanted = new Set();
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name === "page.mdx")
      .map(async (entry) => {
        const mdx = path.join(entry.parentPath, entry.name);
        const route = routeFromPath(mdx);
        const fragment = fragmentFile(route);
        wanted.add(path.basename(fragment));
        const [fragmentStat, mdxStat] = await Promise.all([
          fs.stat(fragment).catch(() => null),
          fs.stat(mdx),
        ]);
        if (fragmentStat && fragmentStat.mtimeMs >= mdxStat.mtimeMs) return;
        const doc = extractSearchDoc(await fs.readFile(mdx, "utf8"), route);
        await writeAtomic(fragment, JSON.stringify(doc));
      }),
  );
  await Promise.all(
    (await fs.readdir(fragmentsDir))
      .filter((f) => f.endsWith(".json") && !wanted.has(f))
      .map((f) => fs.rm(path.join(fragmentsDir, f), { force: true })),
  );
  return mergeSearchIndex();
}

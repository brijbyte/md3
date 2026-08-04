// LLM-facing docs: emits a markdown twin for every NAV route that has a
// page.mdx (out/<route>.md), copies raw demo sources to out/demo-src/<route>/,
// and writes an out/llms.txt index from nav.ts. Runs after `next build`
// (see the docs `build` script); pure transform helpers are exported for tests.
import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mdxToMdast } from "satteri";

const docsRoot = fileURLToPath(new URL("..", import.meta.url));
const SITE = "https://md3.brijbyte.com";

const DEMO_PREAMBLE = `> Demos are referenced below as root-relative links to complete, standalone
> source files (real package imports, sibling CSS) — resolve them against the
> host this file was fetched from. Fetch a demo's files for a working example;
> \`package.json\` in the same folder lists its dependencies.`;

// import statements in an mdxjsEsm block → { LocalName: "./demo/basic.tsx" }.
export function parseImports(esmSource) {
  const map = {};
  const re = /import\s+(?:([A-Za-z_$][\w$]*)|\{[^}]*\})\s+from\s+["']([^"']+)["']/g;
  for (const [, name, spec] of esmSource.matchAll(re)) {
    if (name) map[name] = spec;
  }
  return map;
}

// Relative import specifiers ("./row", "./size-picker.css") in a demo source.
function relativeImports(source) {
  return [...source.matchAll(/from\s+["'](\.\/[^"']+)["']|import\s+["'](\.\/[^"']+)["']/g)]
    .map((m) => m[1] ?? m[2])
    .filter(Boolean);
}

// Import specifier → on-disk file: extensionless and TS-style `.js`
// specifiers both resolve to the .tsx/.ts actually present in the demo dir.
export function resolveDemoFile(spec, demoFiles) {
  const base = spec.replace(/^\.\//, "");
  const stem = base.replace(/\.js$/, "");
  for (const cand of [base, `${stem}.tsx`, `${stem}.ts`]) {
    if (demoFiles.includes(cand)) return cand;
  }
  return null;
}

// Entry file → its transitive demo-local file list (entry first).
export function collectDemoFiles(entry, demoFiles, readFile) {
  const seen = [];
  const queue = [entry];
  while (queue.length) {
    const file = queue.shift();
    if (!file || seen.includes(file)) continue;
    seen.push(file);
    if (!/\.tsx?$/.test(file)) continue;
    for (const spec of relativeImports(readFile(file))) {
      const resolved = resolveDemoFile(spec, demoFiles);
      if (resolved) queue.push(resolved);
    }
    // Sibling stylesheet by convention, even when not imported by the entry.
    const sibling = file.replace(/\.tsx?$/, ".css");
    if (demoFiles.includes(sibling)) queue.push(sibling);
  }
  return seen;
}

// <SpecLinks links={[{ label, href }, …]} /> → "Links: [label](href) · …".
export function renderSpecLinks(jsxSource) {
  const links = [...jsxSource.matchAll(/label:\s*["']([^"']+)["'],\s*href:\s*["']([^"']+)["']/g)];
  if (!links.length) return null;
  return `Links: ${links.map(([, label, href]) => `[${label}](${href})`).join(" · ")}`;
}

function demoReference(entry, files, route) {
  const base = `/demo-src${route}`;
  const list = files.map((f) => `- ${base}/${f}`).join("\n");
  return `**Demo (\`${entry}\`)** — full source:\n\n${list}`;
}

/**
 * page.mdx source → LLM-facing markdown. `demo` gives access to the route's
 * demo folder: { files: string[], read(file): string } (null when absent).
 */
export function transformPage(source, { route, title, description, demo }) {
  const tree = mdxToMdast(source);
  const imports = {};
  const edits = []; // { start, end, text }
  let hasDemos = false;

  const slice = (node) => source.slice(node.position.start.offset, node.position.end.offset);
  const replace = (node, text) =>
    edits.push({ start: node.position.start.offset, end: node.position.end.offset, text });

  const handleJsx = (node) => {
    const spec = imports[node.name] ?? "";
    if (spec.startsWith("./demo/") && demo) {
      const entry = resolveDemoFile(spec.replace("./demo/", ""), demo.files);
      if (entry) {
        hasDemos = true;
        replace(node, demoReference(entry, collectDemoFiles(entry, demo.files, demo.read), route));
        return;
      }
    }
    if (node.name === "SpecLinks") {
      replace(node, renderSpecLinks(slice(node)) ?? "");
      return;
    }
    // Docs-chrome headings/subtitles (landing pages) duplicate the NAV
    // title/description already prepended — drop them.
    if (node.name === "Typography") {
      replace(node, "");
      return;
    }
    replace(node, `*Interactive example — see [the rendered page](${route}).*`);
  };

  const walk = (node) => {
    switch (node.type) {
      case "yaml":
        replace(node, "");
        return;
      case "mdxjsEsm":
        Object.assign(imports, parseImports(node.value));
        replace(node, "");
        return;
      case "mdxJsxFlowElement":
        handleJsx(node);
        return;
      case "mdxJsxTextElement":
        replace(node, `\`${slice(node)}\``);
        return;
      case "mdxFlowExpression":
      case "mdxTextExpression":
        replace(node, ""); // {/* comments */} and stray expressions
        return;
    }
    node.children?.forEach(walk);
  };
  tree.children.forEach(walk);

  let body = source;
  for (const { start, end, text } of edits.toSorted((a, b) => b.start - a.start)) {
    body = body.slice(0, start) + text + body.slice(end);
  }
  body = body.replace(/\n{3,}/g, "\n\n").trim();

  const header = [`# ${title}`, description, hasDemos ? DEMO_PREAMBLE : null]
    .filter(Boolean)
    .join("\n\n");
  return `${header}\n\n${body}\n`;
}

export function renderLlmsTxt(sections) {
  const lines = [
    "# MD3 React (@brijbyte/md3-react)",
    "",
    "> React implementation of Google's Material Design 3, built as a styled",
    "> layer on top of Base UI. Per-component imports and stylesheets; docs at",
    `> ${SITE}.`,
    "",
    "Every page below is served as markdown at the listed root-relative `.md`",
    "URL — resolve it against the host this file was fetched from. Demo links",
    "inside those pages point to standalone source files under `/demo-src/`;",
    "fetch them for complete, working usage examples.",
  ];
  for (const { label, items } of sections) {
    if (!items.length) continue;
    lines.push("", `## ${label}`, "");
    for (const { path: route, title, description } of items) {
      lines.push(`- [${title}](${route}.md): ${description}`);
    }
  }
  return lines.join("\n") + "\n";
}

async function findPageMdx(route) {
  for (const group of ["(docs)", "(landing)"]) {
    const file = path.join(docsRoot, "src", "app", group, ...route.split("/"), "page.mdx");
    try {
      await fs.access(file);
      return file;
    } catch {}
  }
  return null;
}

async function loadDemo(pageFile) {
  const dir = path.join(path.dirname(pageFile), "demo");
  try {
    const files = (await fs.readdir(dir)).toSorted();
    return {
      dir,
      files,
      read: (f) => readFileSync(path.join(dir, f), "utf8"),
    };
  } catch {
    return null;
  }
}

async function main() {
  const { SECTIONS } = await import("../src/nav.ts");
  const outDir = path.join(docsRoot, "out");
  await fs.access(outDir); // fail loudly when run before `next build`

  const emitted = [];
  for (const section of SECTIONS) {
    const items = [];
    for (const item of section.items) {
      const pageFile = await findPageMdx(item.path);
      if (!pageFile) continue;
      const demo = await loadDemo(pageFile);
      const md = transformPage(await fs.readFile(pageFile, "utf8"), {
        route: item.path,
        title: item.title,
        description: item.description,
        demo,
      });
      const outFile = path.join(outDir, `${item.path.slice(1)}.md`);
      await fs.mkdir(path.dirname(outFile), { recursive: true });
      await fs.writeFile(outFile, md);
      if (demo) {
        const destDir = path.join(outDir, "demo-src", item.path.slice(1));
        await fs.mkdir(destDir, { recursive: true });
        for (const f of demo.files) {
          await fs.copyFile(path.join(demo.dir, f), path.join(destDir, f));
        }
      }
      items.push(item);
    }
    if (items.length) emitted.push({ label: section.label, items });
  }
  await fs.writeFile(path.join(outDir, "llms.txt"), renderLlmsTxt(emitted));
  const total = emitted.reduce((n, s) => n + s.items.length, 0);
  console.log(`llms docs: ${total} pages → out/*.md, out/llms.txt`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}

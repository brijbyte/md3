// Generates the icon-browser data (apps/docs/public/icons-data/) from the built
// @brijbyte/md3-icons dist: a shared index ([name, pascal] per base icon) plus one
// aligned path-data array per style×fill combo. The browser page dynamic-imports one
// combo at a time, rendering plain inline <svg> so 4k+ icons stay cheap (no per-icon
// module import) and the grid can use content-visibility for virtualization.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const docsRoot = fileURLToPath(new URL("..", import.meta.url));
const iconsDist = path.resolve(docsRoot, "../../packages/icons/dist");
const codepointsFile = path.resolve(docsRoot, "../../packages/icons/.cache/codepoints.txt");
// Served as static assets (fetched at runtime by the icon page, one combo at a time).
const outDir = path.resolve(docsRoot, "public/icons-data");

const STYLES = ["outlined", "rounded", "sharp"];
const COMBOS = STYLES.flatMap((style) => [
  { file: style, style, fill: false },
  { file: `${style}-fill`, style, fill: true },
]);
// Per-icon variant data (all 6 combos of one icon) is chunked so the detail card can
// fetch just the selected icon's variants (~1 small chunk) instead of the big combo files.
const VARIANT_CHUNK = 128;
// ~4k icons × 6 combos: bound concurrent reads so we don't flood the fd table.
const READ_POOL = 32;

// account_circle → AccountCircle; digit-leading names get an Icon prefix (build-icons.mjs).
const toPascal = (name) => {
  const pascal = name
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return /^\d/.test(pascal) ? `Icon${pascal}` : pascal;
};

const exists = (file) =>
  fs.access(file).then(
    () => true,
    () => false,
  );

// items → fn(item, i), at most `limit` in flight; results index-aligned.
async function mapPool(items, limit, fn) {
  const results = Array.from({ length: items.length });
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

// Canonical base names (snake_case) — prefer the codepoints cache so search/copy get the
// real names; fall back to the dist filenames (Pascal only) when the cache is absent.
async function baseNames() {
  const cached = await fs.readFile(codepointsFile, "utf8").catch(() => null);
  if (cached != null) {
    return cached
      .split("\n")
      .map((line) => line.split(" ")[0])
      .filter(Boolean);
  }
  return (await fs.readdir(path.join(iconsDist, "outlined")))
    .filter((f) => f.endsWith(".js") && !f.endsWith("Fill.js"))
    .map((f) => f.slice(0, -3));
}

// Pull the path `d` out of a generated module: `createIcon("Name", "<d>")`. The second
// arg is a JSON.stringify'd string, so capture and JSON.parse it.
const D_RE = /createIcon\("[^"]*",\s*("(?:[^"\\]|\\.)*")\)/;
async function readPath(style, pascal) {
  const source = await fs
    .readFile(path.join(iconsDist, style, `${pascal}.js`), "utf8")
    .catch(() => null);
  if (source == null) return null;
  const m = D_RE.exec(source);
  return m ? JSON.parse(m[1]) : null;
}

// True when the generated data is newer than every dist file it derives from.
export async function iconDataFresh() {
  const [indexStat, hasVariants] = await Promise.all([
    fs.stat(path.join(outDir, "index.json")).catch(() => null),
    exists(path.join(outDir, "variants")),
  ]);
  if (!indexStat || !hasVariants) return false;
  const distStats = await Promise.all(
    STYLES.map((style) => fs.stat(path.join(iconsDist, style)).catch(() => null)),
  );
  return distStats.every((stat) => stat && stat.mtimeMs <= indexStat.mtimeMs);
}

export async function buildIconData({ force = false } = {}) {
  if (!force && (await iconDataFresh())) return;
  if (!(await exists(iconsDist)))
    throw new Error(`icons dist missing at ${iconsDist} — build @brijbyte/md3-icons first`);

  const index = [];
  const paths = Object.fromEntries(COMBOS.map((c) => [c.file, []]));
  const perIcon = await mapPool(await baseNames(), READ_POOL, async (name) => {
    const pascal = toPascal(name);
    const ds = await Promise.all(
      COMBOS.map((c) => readPath(c.style, c.fill ? `${pascal}Fill` : pascal)),
    );
    return { name, pascal, ds };
  });
  for (const { name, pascal, ds } of perIcon) {
    // Only include an icon present in every combo, so all path arrays stay index-aligned.
    if (ds.some((d) => d == null)) continue;
    index.push([name, pascal]);
    COMBOS.forEach((c, i) => paths[c.file].push(ds[i]));
  }

  await fs.mkdir(outDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(outDir, "index.json"), JSON.stringify(index)),
    ...COMBOS.map((combo) =>
      fs.writeFile(path.join(outDir, `${combo.file}.json`), JSON.stringify(paths[combo.file])),
    ),
  ]);

  // Per-icon variants, chunked: variants/chunk-<n>.json holds [6 paths in COMBOS order]
  // for each icon in that chunk, so the detail card fetches one small chunk on selection.
  const variantsDir = path.join(outDir, "variants");
  await fs.rm(variantsDir, { recursive: true, force: true });
  await fs.mkdir(variantsDir, { recursive: true });
  const chunkWrites = [];
  for (let n = 0; n * VARIANT_CHUNK < index.length; n++) {
    const rows = [];
    for (let j = 0; j < VARIANT_CHUNK && n * VARIANT_CHUNK + j < index.length; j++) {
      const i = n * VARIANT_CHUNK + j;
      rows.push(COMBOS.map((c) => paths[c.file][i]));
    }
    chunkWrites.push(fs.writeFile(path.join(variantsDir, `chunk-${n}.json`), JSON.stringify(rows)));
  }
  await Promise.all(chunkWrites);
  return index.length;
}

// Run directly: `node scripts/build-icon-data.mjs`. No top-level await —
// next.config.ts imports this module and Next require()s the config graph,
// which rejects ESM graphs containing TLA.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildIconData({ force: true }).then((count) => {
    console.log(`Generated icon data for ${count} icons × ${COMBOS.length} combos.`);
  });
}

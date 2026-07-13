// Generates the icon-browser data (apps/docs/src/pages/icons/data/) from the built
// @brijbyte/md3-icons dist: a shared index ([name, pascal] per base icon) plus one
// aligned path-data array per style×fill combo. The browser page dynamic-imports one
// combo at a time, rendering plain inline <svg> so 4k+ icons stay cheap (no per-icon
// module import) and the grid can use content-visibility for virtualization.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
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

// account_circle → AccountCircle; digit-leading names get an Icon prefix (build-icons.mjs).
const toPascal = (name) => {
  const pascal = name
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return /^\d/.test(pascal) ? `Icon${pascal}` : pascal;
};

// Canonical base names (snake_case) — prefer the codepoints cache so search/copy get the
// real names; fall back to the dist filenames (Pascal only) when the cache is absent.
function baseNames() {
  if (existsSync(codepointsFile)) {
    return readFileSync(codepointsFile, "utf8")
      .split("\n")
      .map((line) => line.split(" ")[0])
      .filter(Boolean);
  }
  return readdirSync(path.join(iconsDist, "outlined"))
    .filter((f) => f.endsWith(".js") && !f.endsWith("Fill.js"))
    .map((f) => f.slice(0, -3));
}

// Pull the path `d` out of a generated module: `createIcon("Name", "<d>")`. The second
// arg is a JSON.stringify'd string, so capture and JSON.parse it.
const D_RE = /createIcon\("[^"]*",\s*("(?:[^"\\]|\\.)*")\)/;
function readPath(style, pascal) {
  const file = path.join(iconsDist, style, `${pascal}.js`);
  if (!existsSync(file)) return null;
  const m = D_RE.exec(readFileSync(file, "utf8"));
  return m ? JSON.parse(m[1]) : null;
}

// True when the generated data is newer than every dist file it derives from.
export function iconDataFresh() {
  const indexFile = path.join(outDir, "index.json");
  if (!existsSync(indexFile) || !existsSync(path.join(outDir, "variants"))) return false;
  const built = statSync(indexFile).mtimeMs;
  return STYLES.every((style) => statSync(path.join(iconsDist, style)).mtimeMs <= built);
}

export function buildIconData({ force = false } = {}) {
  if (!force && iconDataFresh()) return;
  if (!existsSync(iconsDist))
    throw new Error(`icons dist missing at ${iconsDist} — build @brijbyte/md3-icons first`);

  const index = [];
  const paths = Object.fromEntries(COMBOS.map((c) => [c.file, []]));
  for (const name of baseNames()) {
    const pascal = toPascal(name);
    // Only include an icon present in every combo, so all path arrays stay index-aligned.
    const ds = COMBOS.map((c) => readPath(c.style, c.fill ? `${pascal}Fill` : pascal));
    if (ds.some((d) => d == null)) continue;
    index.push([name, pascal]);
    COMBOS.forEach((c, i) => paths[c.file].push(ds[i]));
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(path.join(outDir, "index.json"), JSON.stringify(index));
  for (const combo of COMBOS) {
    writeFileSync(path.join(outDir, `${combo.file}.json`), JSON.stringify(paths[combo.file]));
  }

  // Per-icon variants, chunked: variants/chunk-<n>.json holds [6 paths in COMBOS order]
  // for each icon in that chunk, so the detail card fetches one small chunk on selection.
  const variantsDir = path.join(outDir, "variants");
  rmSync(variantsDir, { recursive: true, force: true });
  mkdirSync(variantsDir, { recursive: true });
  for (let n = 0; n * VARIANT_CHUNK < index.length; n++) {
    const rows = [];
    for (let j = 0; j < VARIANT_CHUNK && n * VARIANT_CHUNK + j < index.length; j++) {
      const i = n * VARIANT_CHUNK + j;
      rows.push(COMBOS.map((c) => paths[c.file][i]));
    }
    writeFileSync(path.join(variantsDir, `chunk-${n}.json`), JSON.stringify(rows));
  }
  return index.length;
}

// Run directly: `node scripts/build-icon-data.mjs`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const count = buildIconData({ force: true });
  console.log(`Generated icon data for ${count} icons × ${COMBOS.length} combos.`);
}

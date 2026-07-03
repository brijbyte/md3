// Generates dist/<style>/<icon>.js + .d.ts from Google Fonts' Material Symbols SVGs,
// downloaded directly from fonts.gstatic.com (the same assets fonts.google.com/icons serves).
// Downloads are cached in .cache/svg/ — first run fetches ~25k files, later runs only new icons.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { build } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const cacheDir = path.join(pkgRoot, ".cache");
const distDir = path.join(pkgRoot, "dist");
// Build into a staging dir, then swap it in — regenerating ~25k files in place
// leaves a seconds-long window where a running docs dev server can't resolve
// half-written imports (e.g. createIcon.js, which is compiled last).
const stagingDir = path.join(pkgRoot, "dist.tmp");
const oldDir = path.join(pkgRoot, "dist.old");

const STYLES = ["outlined", "rounded", "sharp"];
const VARIANTS = [
  { slug: "default", suffix: "" },
  { slug: "fill1", suffix: "-fill" },
];
const VIEWBOX = "0 -960 960 960";

// Canonical Material Symbols name list (the fonts.google.com metadata API only serves
// the Symbols set to its own web app; this codepoints file is the same source of truth).
const CODEPOINTS_URL =
  "https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints";
const svgUrl = (style, name, variant) =>
  `https://fonts.gstatic.com/s/i/short-term/release/materialsymbols${style}/${name}/${variant}/24px.svg`;

const CONCURRENCY = 32;
const RETRIES = 3;

const fetchText = async (/** @type {string} */ url) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt >= RETRIES) throw new Error(`${url}: ${err.message ?? err}`, { cause: err });
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
};

// Icon name list: fetch fresh, fall back to the cached copy when offline.
const codepointsCache = path.join(cacheDir, "codepoints.txt");
let codepoints;
try {
  codepoints = await fetchText(CODEPOINTS_URL);
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(codepointsCache, codepoints);
} catch (err) {
  if (!existsSync(codepointsCache)) throw err;
  console.warn(`Fetching icon list failed (${err.message}); using cached list.`);
  codepoints = readFileSync(codepointsCache, "utf8");
}
const names = codepoints
  .split("\n")
  .map((line) => line.split(" ")[0])
  .filter(Boolean);
console.log(`${names.length} icon names.`);

// Download every missing style×variant SVG into the cache (concurrency-limited pool).
const jobs = [];
for (const style of STYLES) {
  mkdirSync(path.join(cacheDir, "svg", style), { recursive: true });
  for (const name of names) {
    for (const { slug, suffix } of VARIANTS) {
      const file = path.join(cacheDir, "svg", style, `${name}${suffix}.svg`);
      if (!existsSync(file)) jobs.push({ url: svgUrl(style, name, slug), file });
    }
  }
}
if (jobs.length > 0) {
  console.log(`Downloading ${jobs.length} SVGs from fonts.gstatic.com…`);
  let done = 0;
  const missing = [];
  const next = async () => {
    for (let job; (job = jobs.pop()); ) {
      const svg = await fetchText(job.url);
      if (svg === null) missing.push(job.url);
      else writeFileSync(job.file, svg);
      if (++done % 1000 === 0) console.log(`  ${done} downloaded…`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, next));
  if (missing.length > 0) {
    console.warn(`${missing.length} SVGs missing upstream (404), skipped:`);
    for (const url of missing.slice(0, 20)) console.warn(`  ${url}`);
  }
}

// account_circle → AccountCircle (import path + displayName; -fill → Fill suffix).
// Digit-leading names get an Icon prefix (10k → Icon10k).
const toPascal = (/** @type {string} */ name) => {
  const pascal = name
    .split(/[_-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return /^\d/.test(pascal) ? `Icon${pascal}` : pascal;
};

const parseSvg = (/** @type {string} */ svg, /** @type {string} */ file) => {
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1];
  if (viewBox !== VIEWBOX) throw new Error(`${file}: unexpected viewBox "${viewBox}"`);
  const ds = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
  if (ds.length === 0) throw new Error(`${file}: no path data`);
  return ds.join(" ");
};

rmSync(stagingDir, { recursive: true, force: true });
rmSync(oldDir, { recursive: true, force: true }); // leftover from a crashed run
let count = 0;

for (const style of STYLES) {
  const srcDir = path.join(cacheDir, "svg", style);
  const outDir = path.join(stagingDir, style);
  mkdirSync(outDir, { recursive: true });
  const seen = new Set();

  for (const file of readdirSync(srcDir).toSorted()) {
    if (!file.endsWith(".svg")) continue;
    const name = file.slice(0, -4); // e.g. account_circle, account_circle-fill
    const d = parseSvg(readFileSync(path.join(srcDir, file), "utf8"), `${style}/${file}`);
    const pascal = toPascal(name);
    // PascalCase flattens _/- and case-insensitive filesystems flatten case: legacy
    // aliases like addchart collide with add_chart. First sorted name (canonical) wins.
    if (seen.has(pascal.toLowerCase())) {
      console.warn(`  skipping ${style}/${name}: module name ${pascal} already taken`);
      continue;
    }
    seen.add(pascal.toLowerCase());

    writeFileSync(
      path.join(outDir, `${pascal}.js`),
      `import { createIcon } from "../createIcon.js";\n` +
        `export default /*#__PURE__*/ createIcon(${JSON.stringify(pascal)}, ${JSON.stringify(d)});\n`,
    );
    count++;
  }
}

// Runtime helper is authored in JSX; compile it (automatic runtime) for dist.
await build({
  configFile: false,
  logLevel: "warn",
  build: {
    lib: {
      entry: path.join(pkgRoot, "src/createIcon.jsx"),
      formats: ["es"],
      fileName: "createIcon",
    },
    outDir: stagingDir,
    emptyOutDir: false,
    minify: false,
    rollupOptions: { external: [/^react/] },
  },
});
cpSync(path.join(pkgRoot, "src/createIcon.d.ts"), path.join(stagingDir, "createIcon.d.ts"));
// One shared declaration for every icon module (package.json maps ./* types here) —
// icons are default-export only, so a single generic d.ts replaces 25k per-icon copies.
writeFileSync(
  path.join(stagingDir, "icon.d.ts"),
  `import type { Md3Icon } from "./createIcon.js";\n` +
    `declare const Icon: Md3Icon;\nexport default Icon;\n`,
);

// Atomic-ish swap: dist is only ever missing between the two renames.
if (existsSync(distDir)) renameSync(distDir, oldDir);
renameSync(stagingDir, distDir);
rmSync(oldDir, { recursive: true, force: true });
console.log(`Generated ${count} icon modules (${STYLES.join(", ")}).`);

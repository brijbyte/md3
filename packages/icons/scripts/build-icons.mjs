// Generates dist/<style>/<icon>.js + .d.ts from @material-symbols/svg-400
// (npm mirror of Google Fonts' Material Symbols SVGs).
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const pkgRoot = fileURLToPath(new URL("..", import.meta.url));
const svgRoot = path.dirname(require.resolve("@material-symbols/svg-400/package.json"));
const distDir = path.join(pkgRoot, "dist");

const STYLES = ["outlined", "rounded", "sharp"];
const VIEWBOX = "0 -960 960 960";

// account_circle → account-circle (import path), AccountCircle (identifier).
// Digit-leading names get an Icon prefix (10k → Icon10k).
const toKebab = (/** @type {string} */ name) => name.replaceAll("_", "-");
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

rmSync(distDir, { recursive: true, force: true });
let count = 0;

for (const style of STYLES) {
  const srcDir = path.join(svgRoot, style);
  const outDir = path.join(distDir, style);
  mkdirSync(outDir, { recursive: true });

  for (const file of readdirSync(srcDir)) {
    if (!file.endsWith(".svg")) continue;
    const name = file.slice(0, -4); // e.g. account_circle, account_circle-fill
    const d = parseSvg(readFileSync(path.join(srcDir, file), "utf8"), `${style}/${file}`);
    const kebab = toKebab(name);
    const pascal = toPascal(name);

    writeFileSync(
      path.join(outDir, `${kebab}.js`),
      `import { createIcon } from "../createIcon.js";\n` +
        `const ${pascal} = /*#__PURE__*/ createIcon(${JSON.stringify(pascal)}, ${JSON.stringify(d)});\n` +
        `export { ${pascal} };\nexport default ${pascal};\n`,
    );
    writeFileSync(
      path.join(outDir, `${kebab}.d.ts`),
      `import type { Md3Icon } from "../createIcon.js";\n` +
        `declare const ${pascal}: Md3Icon;\n` +
        `export { ${pascal} };\nexport default ${pascal};\n`,
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
    outDir: distDir,
    emptyOutDir: false,
    minify: false,
    rollupOptions: { external: [/^react/] },
  },
});
cpSync(path.join(pkgRoot, "src/createIcon.d.ts"), path.join(distDir, "createIcon.d.ts"));
console.log(`Generated ${count} icon modules (${STYLES.join(", ")}).`);

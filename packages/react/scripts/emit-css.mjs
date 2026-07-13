// Post-build CSS layout, mirroring the old vite md3EmitCss plugin:
// tsdown's css.splitting emits one dist/<folder>/<Name>.css per module — flatten
// those to dist/styles/<folder>.css, add the standalone token stylesheets, the
// aggregated dist/index.css, and the css-manifest.json.
import { globSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tailwindTokensCssPath, tokensCssPath } from "./build-tokens.mjs";
import { buildCssManifest } from "./build-css-manifest.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const stylesDir = join(distDir, "styles");

// tokens/tailwind aren't per-component: excluded from the component aggregate.
const NON_COMPONENT = new Set(["tokens", "tailwind-tokens"]);

export function emitCss() {
  mkdirSync(stylesDir, { recursive: true });

  // Flatten dist/<component>/<Name>.css -> dist/styles/<component>.css. Each
  // component folder holds exactly one *.module.css, so this is 1:1; a shared
  // module (Button.module.css) stays attributed to its own folder (rolldown
  // dedupes it into that chunk, not every importer).
  for (const file of globSync(join(distDir, "*/*.css"))) {
    if (dirname(file) === stylesDir) continue;
    const component = basename(dirname(file));
    writeFileSync(join(stylesDir, `${component}.css`), readFileSync(file, "utf8"));
    rmSync(file);
  }

  const tokensCss = readFileSync(tokensCssPath, "utf8");
  writeFileSync(join(stylesDir, "tokens.css"), tokensCss);
  // Tailwind-only theme file: shipped standalone, never in the aggregate.
  writeFileSync(join(stylesDir, "tailwind-tokens.css"), readFileSync(tailwindTokensCssPath, "utf8"));

  // Aggregate from the finalized styles/ dir so a watch rebuild that re-emits no
  // split css (e.g. a .tsx-only change) still produces a complete index.css.
  const componentCss = new Map();
  for (const file of globSync(join(stylesDir, "*.css"))) {
    const name = basename(file, ".css");
    if (!NON_COMPONENT.has(name)) componentCss.set(name, readFileSync(file, "utf8"));
  }

  // Tokens first to establish @layer order, ripple next, then components.
  const rippleCss = componentCss.get("ripple") ?? "";
  const sortedComponentCss = [...componentCss.keys()]
    .filter((name) => name !== "ripple")
    .toSorted()
    .map((name) => componentCss.get(name));
  writeFileSync(join(distDir, "index.css"), [tokensCss, rippleCss, ...sortedComponentCss].join("\n"));

  writeFileSync(
    join(distDir, "css-manifest.json"),
    `${JSON.stringify(buildCssManifest(), null, 2)}\n`,
  );
}

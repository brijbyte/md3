// Generates dist/css-manifest.json: component name -> ordered list of css
// basenames (no extension) a consumer must import for it to render correctly.
// Derived by statically walking each component's import graph from its
// src/<name>/index.ts entry and recording every *.module.css it (transitively)
// pulls in — this is how family reuse (icon-button/fab/split-button reusing
// Button.module.css) and ripple usage are discovered, with no manual upkeep.
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");

export const cssManifestPath = join(root, "dist/css-manifest.json");

const IMPORT_RE =
  /(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']/g;

function componentNames() {
  return readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "ripple" && e.name !== "utils")
    .filter((e) => existsSync(join(srcDir, e.name, "index.ts")))
    .map((e) => e.name)
    .toSorted();
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith(".")) return null; // package import, not part of the src graph
  const base = join(dirname(fromFile), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function topFolder(absPath) {
  return relative(srcDir, absPath).split("/")[0];
}

// BFS over the import graph starting at src/<name>/index.ts, collecting the
// top-level src folder of every *.module.css transitively imported.
function cssDeps(name) {
  const entry = join(srcDir, name, "index.ts");
  const queue = [entry];
  const visitedFiles = new Set(queue);
  const cssFolders = new Set();

  while (queue.length) {
    const file = queue.shift();
    const contents = readFileSync(file, "utf8");
    for (const match of contents.matchAll(IMPORT_RE)) {
      const spec = match[1] ?? match[2] ?? match[3];
      if (spec.endsWith(".module.css")) {
        const resolved = join(dirname(file), spec);
        if (existsSync(resolved)) cssFolders.add(topFolder(resolved));
        continue;
      }
      const resolved = resolveImport(file, spec);
      if (resolved && !visitedFiles.has(resolved)) {
        visitedFiles.add(resolved);
        queue.push(resolved);
      }
    }
  }

  return cssFolders;
}

export function buildCssManifest() {
  const manifest = {};

  for (const name of componentNames()) {
    const deps = cssDeps(name);
    deps.delete(name);
    const usesRipple = deps.delete("ripple");
    const rest = [...deps].toSorted();

    manifest[name] = [...new Set(["tokens", ...(usesRipple ? ["ripple"] : []), ...rest, name])];
  }

  return manifest;
}

export function writeCssManifest() {
  writeFileSync(cssManifestPath, `${JSON.stringify(buildCssManifest(), null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeCssManifest();
  console.log(`css-manifest.json generated at ${cssManifestPath}`);
}

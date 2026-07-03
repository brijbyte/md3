// Refreshes packages/react/tokens/component-specs.json from Google's
// material-web repo (the data behind m3.material.io component specs).
// Usage: pnpm refresh:specs [component-name ...]
//   With no args, re-fetches every component already in the file.
//   Extra args add new components, e.g. `pnpm refresh:specs assist-chip`.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = "v0_192";
const BASE = `https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/${VERSION}`;
const specsPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../packages/react/tokens/component-specs.json",
);

/** Parses the `@return (...)` token map of a material-web token scss file. */
function parseTokens(/** @type {string} */ scss) {
  const ret = scss.match(/@return \(([\s\S]*)\);\s*}\s*$/);
  if (!ret) return null;
  const body = ret[1].replace(/\/\*\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ");
  /** @type {Record<string, string>} */
  const tokens = {};
  const entry = /'([a-z0-9-]+)':\s*((?:[^,()]|\([^()]*(?:\([^()]*\)[^()]*)*\))+)/g;
  let match;
  while ((match = entry.exec(body))) {
    tokens[match[1]] = match[2]
      .replace(/map\.get\(\$deps, '([a-z-]+)', '([a-z0-9-]+)'\)/g, "$1.$2")
      .replace(/if\(\$exclude-hardcoded-values, null, (.+)\)/, "$1")
      .trim();
  }
  return tokens;
}

/** @type {Record<string, Record<string, string>>} */
const specs = JSON.parse(readFileSync(specsPath, "utf8"));
const components = [...new Set([...Object.keys(specs), ...process.argv.slice(2)])].toSorted();

const results = await Promise.all(
  components.map(async (name) => {
    const response = await fetch(`${BASE}/_md-comp-${name}.scss`);
    if (!response.ok) return { name, error: `HTTP ${response.status}` };
    const tokens = parseTokens(await response.text());
    if (!tokens) return { name, error: "no @return token map found" };
    return { name, tokens };
  }),
);

let failed = false;
for (const result of results) {
  if (result.tokens) {
    specs[result.name] = result.tokens;
    console.log(`ok   ${result.name} (${Object.keys(result.tokens).length} tokens)`);
  } else {
    failed = true;
    console.error(`FAIL ${result.name}: ${result.error}`);
  }
}

writeFileSync(
  specsPath,
  `${JSON.stringify(Object.fromEntries(Object.entries(specs).toSorted()), null, 2)}\n`,
);
console.log(`\nWrote ${specsPath}`);
if (failed) process.exit(1);

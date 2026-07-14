import { expect, test } from "vitest";

// Regression: LinearProgress/CircularProgress shipped unlayered rules, so a
// consumer's unlayered override of the same specificity lost by source order —
// breaking the cascade-layers contract (all library CSS in @layer theme/components,
// unlayered consumer CSS always wins). @property is top-level-only per spec.
const modules = import.meta.glob("./**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const TOP_LEVEL_OK = /^@(layer|property|import|charset)\b/;

// Openers of top-level blocks that aren't layer-exempt at-rules.
function unlayeredRules(css: string): string[] {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const offenders: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of src) {
    if (ch === "{") {
      if (depth === 0) {
        const opener = buf.trim();
        if (!TOP_LEVEL_OK.test(opener)) offenders.push(opener);
      }
      depth++;
      buf = "";
    } else if (ch === "}") {
      depth--;
      buf = "";
    } else if (depth === 0) {
      buf += ch;
    }
  }
  return offenders;
}

test("every module.css keeps all rules inside @layer", () => {
  expect(Object.keys(modules).length).toBeGreaterThan(0);
  for (const [file, css] of Object.entries(modules)) {
    expect.soft(unlayeredRules(css), `${file} has rules outside @layer`).toEqual([]);
  }
});

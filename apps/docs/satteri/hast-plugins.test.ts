import { describe, expect, it } from "vitest";
import { mdxToJs } from "satteri";
import { stripTableWhitespace } from "./hast-plugins.mjs";

const TABLE_MDX = `
| Token | Utility |
| ----- | ------- |
| \`--md-sys-color-primary\` | \`bg-primary\` |
| \`--md-sys-color-outline\` | \`border-outline\` |
`;

// No static collapse (what next.config.ts's optimizeStatic: false gets us):
// per-node JSX is exactly what lets GFM's newline text nodes survive into
// table children.
function compile(hastPlugins: unknown[]) {
  const result = mdxToJs(TABLE_MDX, {
    features: { gfm: true },
    optimizeStatic: undefined,
    hastPlugins: hastPlugins as never,
  });
  const js = (result as { code?: string }).code ?? String(result);
  // The table's JSX call through the end of the module — the whole rendered tree.
  return js.slice(js.indexOf("_components.table, {"));
}

describe("stripTableWhitespace", () => {
  // Control: documents the satteri behavior the plugin exists for. If this
  // starts failing, satteri strips the whitespace itself and the plugin can go.
  it("satteri still emits newline children in tables without it", () => {
    expect(compile([])).toContain('"\\n"');
  });

  it("removes whitespace text children from table elements", () => {
    const out = compile([stripTableWhitespace()]);
    expect(out).not.toContain('"\\n"');
    // The real content is untouched.
    expect(out).toContain("thead");
    expect(out).toContain("bg-primary");
  });
});

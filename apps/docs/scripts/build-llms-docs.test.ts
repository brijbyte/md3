import { describe, expect, it } from "vitest";
import {
  collectDemoFiles,
  parseImports,
  resolveDemoFile,
  renderLlmsTxt,
  renderSpecLinks,
  transformPage,
} from "./build-llms-docs.mjs";

const PAGE = `---
title: Widget
---

import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/widget");

import WidgetBasic from "./demo/basic.js";
import { SpecLinks } from "@/components/SpecLinks";
import { TypeScale } from "./TypeScale.tsx";

\`\`\`tsx
import { Widget } from "@brijbyte/md3-react/widget";
\`\`\`

<SpecLinks links={[{ label: "MD3 spec", href: "https://example.com/spec" }]} />

## Basic

Prose stays as-is, with \`inline code\` and <Kbd>K</Kbd> inline JSX.

{/* an mdx comment */}

<WidgetBasic />

<TypeScale />

<llm-only>
LLM-only prose with a nested demo:

<WidgetBasic />
</llm-only>
`;

const demo = {
  files: ["basic.css", "basic.tsx", "helper.tsx", "package.json"],
  read: (f: string) => (f === "basic.tsx" ? 'import { Helper } from "./helper";\n' : ""),
};

const ctx = { route: "/components/widget", title: "Widget", description: "A widget.", demo };

describe("transformPage", () => {
  const md = transformPage(PAGE, ctx);

  it("prepends title/description and the demo preamble", () => {
    expect(md).toMatch(/^# Widget\n\nA widget\.\n\n> Demos are referenced/);
  });

  it("strips frontmatter, imports, exports, and mdx comments", () => {
    expect(md).not.toContain("routeMetadata");
    expect(md).not.toContain("import WidgetBasic");
    expect(md).not.toContain("mdx comment");
    expect(md).not.toContain("title: Widget");
  });

  it("keeps markdown prose and code fences verbatim", () => {
    expect(md).toContain('import { Widget } from "@brijbyte/md3-react/widget";');
    expect(md).toContain("Prose stays as-is, with `inline code`");
  });

  it("expands demo tags into root-relative source links (entry, helpers, css)", () => {
    expect(md).toContain("**Demo (`basic.tsx`)**");
    expect(md).toContain("- /demo-src/components/widget/basic.tsx");
    expect(md).toContain("- /demo-src/components/widget/basic.css");
    expect(md).toContain("- /demo-src/components/widget/helper.tsx");
  });

  it("renders SpecLinks as markdown links", () => {
    expect(md).toContain("Links: [MD3 spec](https://example.com/spec)");
  });

  it("replaces other JSX with a pointer to the rendered page", () => {
    expect(md).toContain("*Interactive example — see [the rendered page](/components/widget).*");
    expect(md).not.toContain("<TypeScale");
  });

  it("unwraps <llm-only> content, handling nested tags", () => {
    expect(md).toContain("LLM-only prose with a nested demo:");
    expect(md).not.toContain("llm-only");
    expect(md.match(/\*\*Demo \(`basic\.tsx`\)\*\*/g)).toHaveLength(2);
  });

  it("wraps inline JSX in inline code", () => {
    expect(md).toContain("`<Kbd>K</Kbd>`");
  });

  it("omits the demo preamble on pages without demos", () => {
    const noDemo = transformPage("Just prose.\n", { ...ctx, demo: null });
    expect(noDemo).not.toContain("> Demos are referenced");
    expect(noDemo).toContain("Just prose.");
  });
});

describe("parseImports", () => {
  it("maps default imports to specifiers, skipping named imports", () => {
    expect(parseImports('import A from "./demo/a.tsx";\nimport { b } from "@/b";')).toEqual({
      A: "./demo/a.tsx",
    });
  });
});

describe("resolveDemoFile", () => {
  it("maps TS-style .js and extensionless specifiers to the on-disk file", () => {
    expect(resolveDemoFile("./basic.js", demo.files)).toBe("basic.tsx");
    expect(resolveDemoFile("./helper", demo.files)).toBe("helper.tsx");
    expect(resolveDemoFile("./basic.css", demo.files)).toBe("basic.css");
    expect(resolveDemoFile("./missing.js", demo.files)).toBeNull();
  });
});

describe("collectDemoFiles", () => {
  it("follows relative imports and sibling css, entry first", () => {
    expect(collectDemoFiles("basic.tsx", demo.files, demo.read)).toEqual([
      "basic.tsx",
      "helper.tsx",
      "basic.css",
    ]);
  });
});

describe("renderSpecLinks", () => {
  it("returns null when no links parse", () => {
    expect(renderSpecLinks("<SpecLinks links={links} />")).toBeNull();
  });
});

describe("renderLlmsTxt", () => {
  it("lists pages per section with .md URLs", () => {
    const txt = renderLlmsTxt([
      {
        label: "Components",
        items: [{ path: "/components/widget", title: "Widget", description: "A widget." }],
      },
    ]);
    expect(txt).toContain("## Components");
    expect(txt).toContain("- [Widget](/components/widget.md): A widget.");
  });
});

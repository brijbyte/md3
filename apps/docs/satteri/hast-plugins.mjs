// Sätteri hast plugins for the docs MDX pipeline, ported from the old Vite
// config. Each export is a factory: satteri-nextjs string specs
// ("<abs path>#name") call it per compile, so per-document state (the heading
// id chain) resets between pages. Referenced from next.config.ts — string
// specs are JSON-serializable, so they apply under webpack AND Turbopack.
import { defineHastPlugin } from "satteri";
import { codeToHast } from "shiki";

// One theme pair for fenced MDX blocks and demo source tabs alike (the demo
// loader mirrors it). Light is github-light-default: material-theme-lighter's
// oranges/teals fall well below WCAG AA contrast on surface-container.
export const SHIKI_THEMES = { light: "github-light-default", dark: "github-dark-dimmed" };

// Heading anchor ids: lowercased text, punctuation stripped, whitespace runs
// collapsed to a dash ("Shapes & toggle" → "shapes-toggle").
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Nested heading ids: a heading's id chains its ancestors' slugs with its own,
// so an h3 under "Icon buttons" gets "icon-buttons-<h3-slug>". One chain per document.
function createIdChain() {
  const stack = []; // slug per depth, h2 at index 0
  return (depth, slug) => {
    const i = Math.max(0, depth - 2);
    stack.length = i;
    stack[i] = slug;
    return stack.filter(Boolean).join("-");
  };
}

// satteri-nextjs's collectHeadings runs after user plugins and respects
// existing ids, so the `toc` export picks these chained ids up unchanged.
export function headingIds() {
  const chain = createIdChain();
  return defineHastPlugin({
    name: "heading-ids",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node, ctx) {
        const depth = Number(node.tagName[1]);
        // Explicit ids win but still enter the chain so descendants nest under them.
        const own = node.properties?.id
          ? String(node.properties.id)
          : slugify(ctx.textContent(node));
        if (!own) return;
        const id = chain(depth, own);
        if (!node.properties?.id) ctx.setProperty(node, "id", id);
      },
    },
  });
}

// GFM alert blocks (`> [!NOTE]` …): Sätteri's GFM doesn't parse them, so tag the
// blockquote here; mdx-components renders [data-alert] blockquotes as callouts.
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/;
export function alerts() {
  return defineHastPlugin({
    name: "gfm-alerts",
    element: {
      filter: ["blockquote"],
      // Nodes are readonly views over the Rust arena — mutate via ctx only.
      visit(node, ctx) {
        const para = node.children.find((c) => c.type === "element" && c.tagName === "p");
        if (!para || para.type !== "element") return;
        const [text] = para.children;
        if (!text || text.type !== "text") return;
        const m = ALERT_RE.exec(text.value);
        if (!m) return;
        const rest = text.value.slice(m[0].length);
        if (rest) ctx.replaceNode(text, { type: "text", value: rest });
        else ctx.removeChildAt(para, 0);
        ctx.setProperty(node, "data-alert", m[1].toLowerCase());
      },
    },
  });
}

export function externalLinks() {
  return defineHastPlugin({
    name: "external-links",
    element: {
      filter: ["a"],
      visit(node, ctx) {
        const href = node.properties?.href;
        if (!href || typeof href !== "string") return;
        if (href[0] === "#" || !href.match(/^https?:\/\//)) return;
        ctx.setProperty(node, "target", "_blank");
        ctx.setProperty(node, "rel", "noopener noreferrer");
        ctx.setProperty(node, "data-external", "");
      },
    },
  });
}

// Compile-time syntax highlighting: replace fenced code blocks with Shiki's hast.
// Dual themes emit --shiki-light/--shiki-dark vars per token; app.css picks one by
// [data-theme]. Zero client JS. Inline code (no language- class) is left alone.
export function shiki() {
  return defineHastPlugin({
    name: "shiki",
    element: {
      filter: ["pre"],
      async visit(node, ctx) {
        const code = node.children.find((c) => "tagName" in c && c.tagName === "code");
        if (!code || code.type !== "element") return;
        const className = code.properties?.className;
        const lang = (Array.isArray(className) ? className : [className])
          .find((c) => typeof c === "string" && c.startsWith("language-"))
          ?.slice("language-".length);
        if (!lang) return;
        const hast = await codeToHast(ctx.textContent(code).replace(/\n$/, ""), {
          lang,
          themes: SHIKI_THEMES,
          defaultColor: false,
        });
        const pre = hast.children[0];
        if (pre.type === "element") pre.properties["data-language"] = lang;
        return toReactProps(pre);
      },
    },
  });
}

// Shiki emits HTML attribute names; rename them so the compiled JSX gets React props.
// `style` stays a string: Sätteri converts it to a JSX style object itself and
// silently drops object values.
function toReactProps(node) {
  if (node && typeof node === "object" && "properties" in node) {
    const props = node.properties;
    if (props?.class !== undefined) {
      props.className = props.class;
      delete props.class;
    }
    if (props?.tabindex !== undefined) {
      props.tabIndex = props.tabindex;
      delete props.tabindex;
    }
    if ("children" in node && Array.isArray(node.children)) node.children.forEach(toReactProps);
  }
  return node;
}

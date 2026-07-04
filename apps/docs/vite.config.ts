import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineHastPlugin } from "satteri";
import { type BundledLanguage, codeToHast, codeToHtml } from "shiki";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import satteri from "vite-plugin-satteri";

export default defineConfig({
  plugins: [
    mdxPlugin(),
    tailwindcss(),
    react(),
    fixRscDevCssRemoval(),
    rsc({
      entries: {
        client: "./src/framework/entry.browser.tsx",
        rsc: "./src/framework/entry.rsc.tsx",
        ssr: "./src/framework/entry.ssr.tsx",
      },
    }),
    ssgPlugin(),
    demosPlugin(),
  ],
  resolve: {
    tsconfigPaths: true,
    // tsconfigPaths only aliases imports from files the tsconfig covers — .mdx and
    // .css importers fall through to the built package (a second, dist copy of every
    // component). Mirror the tsconfig paths here so all importers resolve to src.
    alias: [
      {
        find: /^@brijbyte\/md3-react\/styles\.css$/,
        replacement: path.resolve(import.meta.dirname, "../../packages/react/src/dev-styles.css"),
      },
      {
        find: /^@brijbyte\/md3-react\/tailwind-tokens\.css$/,
        replacement: path.resolve(
          import.meta.dirname,
          "../../packages/react/src/generated/tailwind-tokens.css",
        ),
      },
      {
        // Source css modules by path (demo.tsx imports these into the server graph
        // so dev SSR links the code-showcase chrome css at first paint — no FOUC).
        find: /^@brijbyte\/md3-react\/(.+\.module\.css)$/,
        replacement: path.resolve(import.meta.dirname, "../../packages/react/src/$1"),
      },
      {
        find: /^@brijbyte\/md3-react\/(.+)$/,
        replacement: path.resolve(import.meta.dirname, "../../packages/react/src/$1/index.ts"),
      },
    ],
  },
});

// .mdx → server-safe JS (Sätteri, enforce pre — all RSC environments see plain modules).
// Guard: plugin-rsc emits virtual ids ending in ".mdx" ("…facade:src/x.mdx") that satteri's
// extension regex would wrongly compile as MDX; only pass through real on-disk files.
function mdxPlugin(): Plugin {
  const base = satteri({
    markdown: false,
    features: { gfm: true, frontmatter: true },
    hastPlugins: [headingIdsHastPlugin(), alertsHastPlugin(), shikiHastPlugin()],
  });
  const transform = base.transform as (
    this: unknown,
    code: string,
    id: string,
  ) => Promise<{ code: string; map: null } | null>;
  return {
    ...base,
    async transform(code, id) {
      if (id.startsWith("\0") || id.includes("virtual:")) {
        return null;
      }
      const result = await transform.call(this, code, id);
      // Compiled MDX also exports its heading outline (for the floating TOC);
      // ids match headingIdsHastPlugin — same slugify over the same text.
      if (result && id.endsWith(".mdx")) {
        result.code += `\nexport const toc = ${JSON.stringify(extractToc(code))};\n`;
      }
      return result;
    },
  };
}

// Markdown heading outline (h2–h6) of an MDX source: fenced code blocks are
// dropped first (a `# comment` in a sh block is not a heading), inline code and
// link syntax are unwrapped to their text.
function extractToc(source: string) {
  const items: { depth: number; text: string; id: string }[] = [];
  const body = source.replace(/^```[\s\S]*?^```/gm, "");
  for (const m of body.matchAll(/^(#{2,6})\s+(.+?)\s*$/gm)) {
    const text = m[2].replace(/`([^`]*)`/g, "$1").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
    items.push({ depth: m[1].length, text, id: slugify(text) });
  }
  return items;
}

// One theme pair for fenced MDX blocks and demo source tabs alike. Light is
// github-light-default: material-theme-lighter's oranges/teals fall well below
// WCAG AA contrast on the surface-container background.
const SHIKI_THEMES = { light: "github-light-default", dark: "github-dark-dimmed" };

// Heading anchor ids: lowercased text, punctuation stripped, whitespace runs
// collapsed to a dash ("Shapes & toggle" → "shapes-toggle").
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function headingIdsHastPlugin() {
  return defineHastPlugin({
    name: "heading-ids",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node, ctx) {
        if (node.properties?.id) return;
        const id = slugify(ctx.textContent(node));
        if (id) ctx.setProperty(node, "id", id);
      },
    },
  });
}

// GFM alert blocks (`> [!NOTE]` …): Sätteri's GFM doesn't parse them, so tag the
// blockquote here; mdx-components renders [data-alert] blockquotes as callouts.
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n?/;
function alertsHastPlugin() {
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

// Compile-time syntax highlighting: replace fenced code blocks with Shiki's hast.
// Dual themes emit --shiki-light/--shiki-dark vars per token; app.css picks one by
// [data-theme]. Zero client JS. Inline code (no language- class) is left alone.
function shikiHastPlugin() {
  return defineHastPlugin({
    name: "shiki",
    element: {
      filter: ["pre"],
      async visit(node, ctx) {
        const code = node.children.find((c) => "tagName" in c && c.tagName === "code");
        if (!code || code.type !== "element") return;
        const className = code.properties?.className;
        const lang = (Array.isArray(className) ? className : [className])
          .find((c): c is string => typeof c === "string" && c.startsWith("language-"))
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
function toReactProps<T>(node: T): T {
  if (node && typeof node === "object" && "properties" in node) {
    const props = node.properties as Record<string, unknown>;
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

// A demo's showable sources: the entry file plus its relative imports, breadth-first
// (extensionless specifiers try .tsx/.ts; css imports are included verbatim).
function collectDemoFiles(dir: string, entry: string) {
  const files: string[] = [];
  const queue = [entry];
  while (queue.length) {
    const rel = queue.shift()!;
    if (files.includes(rel)) continue;
    files.push(rel);
    if (!/\.[jt]sx?$/.test(rel)) continue;
    const src = fs.readFileSync(path.join(dir, rel), "utf8");
    for (const m of src.matchAll(/(?:from|import)\s+["']\.\/([^"']+)["']/g)) {
      const hit = [m[1], `${m[1]}.tsx`, `${m[1]}.ts`].find((f) => fs.existsSync(path.join(dir, f)));
      if (hit) queue.push(hit);
    }
  }
  return files;
}

// Dev FOUC fix: plugin-rsc's RemoveDuplicateServerCss deletes every server-rendered
// client-reference css <link> on its first hydration effect, assuming the client
// chunks' injected styles have taken over — but under slow loads hydration beats the
// lazy chunks, stripping live styles for a visibly unstyled window until the chunks
// arrive (styled → unstyled → styled). Override the dev-only virtual module so a
// link is only removed once vite's injected <style data-vite-dev-id> for the same
// file exists; a head MutationObserver retires the rest as their styles land.
function fixRscDevCssRemoval(): Plugin {
  const VIRTUAL = "virtual:vite-rsc/remove-duplicate-server-css";
  return {
    name: "md3:fix-rsc-dev-css-removal",
    apply: "serve",
    resolveId(id) {
      if (id === VIRTUAL) return "\0" + VIRTUAL;
    },
    load(id) {
      if (id !== "\0" + VIRTUAL) return;
      return `\
"use client"
import * as React from "react";

const SELECTOR = "link[rel='stylesheet'][data-precedence^='vite-rsc/client-reference']";

function hasInjectedStyle(link) {
  const path = decodeURIComponent(new URL(link.href, location.href).pathname)
    .replace(/^\\/@fs/, "");
  for (const style of document.querySelectorAll("style[data-vite-dev-id]")) {
    const id = style.getAttribute("data-vite-dev-id").split("?")[0];
    if (id === path || id.endsWith(path)) return true;
  }
  return false;
}

function sweep() {
  for (const link of document.querySelectorAll(SELECTOR)) {
    if (hasInjectedStyle(link)) link.remove();
  }
  return document.querySelector(SELECTOR) === null;
}

export default function RemoveDuplicateServerCss() {
  React.useEffect(() => {
    if (sweep()) return;
    const observer = new MutationObserver(() => {
      if (sweep()) observer.disconnect();
    });
    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
`;
    },
  };
}

// Standalone demos: each src/pages/<page>/demo/ folder is a drop-in package (its
// package.json declares the real deps) holding one tsx per demo. Pages import a
// demo by its real path ("./demo/button-sizes.tsx" — clickable, typo = resolve
// error) and render it directly; the import resolves to a facade that wraps the
// component in the <Demo> chrome (playground surface + highlighted-source tabs).
// Demo files import the library by its published specifiers (incl. styles.css),
// so a folder copies out of the repo verbatim; the docs aliases above redirect
// those to library source.
function demosPlugin(): Plugin {
  const pagesDir = path.resolve(import.meta.dirname, "src/pages");

  // A page's demo files, entries and helpers alike (invalidation over-approximates:
  // ids that never resolved simply aren't in the module graph).
  const demoNamesForPage = (page: string) => {
    const dir = path.join(pagesDir, page, "demo");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => f.slice(0, -".tsx".length));
  };

  // Per-demo source-code module: reads the demo's entry file, its relative imports,
  // and its sibling css, Shiki-highlights each at compile time, and exports
  // FILES = [{ name, code, html }] for the <Demo> code tabs. Zero client JS.
  const DEMO_CODE = "virtual:md3-demo-code:";
  const RESOLVED_CODE = "\0" + DEMO_CODE;
  const codeIdsForPage = (page: string) =>
    demoNamesForPage(page).map((name) => RESOLVED_CODE + `${page}/${name}`);

  // Facade for a demo entry imported from its page: the entry component wrapped
  // in the <Demo> chrome (playground + code tabs) with its code loader, so pages
  // render `<ButtonSizes />` directly — no manual Demo wrapper.
  const FACADE = "\0md3-demo:";
  const demoComponent = path.resolve(import.meta.dirname, "src/components/demo.tsx");
  const facadeIdsForPage = (page: string) =>
    demoNamesForPage(page).map((name) => FACADE + `${page}/${name}`);

  // Each demo tsx imports a sibling css file listing the library stylesheets a
  // consumer needs (drop-in fidelity). In the docs app that css must not compile
  // as-is (its @imports target the published package, and identical outputs would
  // dedupe into one asset, desyncing plugin-rsc's per-chunk manifest). Instead it
  // resolves to a virtual JS module importing the equivalent library *source* css
  // (the component CSS Modules). That also puts those styles in the server module
  // graph, so dev SSR emits them in <head> at first paint — otherwise they'd only
  // arrive with the client JS modules (FOUC on slow networks). tokens.css is
  // skipped: app.css already provides it globally.
  const DEMO_CSS = "\0md3-demo-css:";
  const libSrc = path.resolve(import.meta.dirname, "../../packages/react/src");
  function demoCssToImports(cssPath: string) {
    const imports: string[] = [];
    const css = fs.readFileSync(cssPath, "utf8");
    for (const m of css.matchAll(/@import\s+["']@brijbyte\/md3-react\/([\w-]+)\.css["']/g)) {
      if (m[1] === "tokens") continue;
      const dir = path.join(libSrc, m[1]);
      const mod = fs.readdirSync(dir).find((f) => f.endsWith(".module.css"));
      if (!mod) throw new Error(`[md3:demos] no source css for import "${m[1]}.css" in ${cssPath}`);
      imports.push(`import ${JSON.stringify(path.join(dir, mod))};`);
    }
    // A demo css can also carry its own layout rules; those must ship in every
    // environment, so import the raw file too (the transform below strips its
    // library @imports first). Skipped when import-only: identical empty outputs
    // across demos would dedupe into one asset and desync plugin-rsc's manifest.
    if (css.replace(/@import\s+["']@brijbyte\/md3-react\/[^"']+["'];?/g, "").trim()) {
      imports.push(`import ${JSON.stringify(cssPath)};`);
    }
    return imports.join("\n") + "\n";
  }

  return {
    name: "md3:demos",
    // Pre: demo css imports and entry facades must be intercepted before the
    // default resolver (and other plugins) resolve them to the raw files.
    enforce: "pre",
    resolveId(id, importer) {
      if (id.startsWith(DEMO_CODE)) return "\0" + id;
      if (!importer?.startsWith(pagesDir + path.sep)) return;
      if (
        id.startsWith("./") &&
        id.endsWith(".css") &&
        importer.includes(`${path.sep}demo${path.sep}`)
      ) {
        // ".js" suffix: the module is JS (css-module imports), and extension
        // sniffers (tailwind's transform filter) must not treat the id as css.
        return DEMO_CSS + path.resolve(path.dirname(importer), id) + ".js";
      }
      // A page importing one of its demo files gets the facade. Demo-internal
      // relative imports (helpers like ./row) resolve normally.
      const entry = /^\.\/demo\/([\w-]+)\.tsx$/.exec(id);
      if (entry && !importer.includes(`${path.sep}demo${path.sep}`)) {
        const page = path.relative(pagesDir, importer).split(path.sep)[0];
        if (fs.existsSync(path.join(pagesDir, page, "demo", `${entry[1]}.tsx`))) {
          return FACADE + `${page}/${entry[1]}`;
        }
      }
    },
    // plugin-rsc's css-export transform also links the raw demo css file in dev;
    // its library @imports only mean something to a consumer's bundler, so strip
    // them before vite's css pipeline tries (and fails) to resolve them.
    transform(code, id) {
      // Dev serves link-fetched css with a query ("?direct") — match on the file.
      const file = id.split("?")[0];
      if (file.startsWith(pagesDir + path.sep) && /[\\/]demo[\\/][\w-]+\.css$/.test(file)) {
        return code.replace(/@import\s+["']@brijbyte\/md3-react\/[^"']+["'];?/g, "");
      }
    },
    async load(id) {
      if (id.startsWith(FACADE)) {
        const key = id.slice(FACADE.length);
        const page = key.slice(0, key.indexOf("/"));
        const name = key.slice(key.indexOf("/") + 1);
        const abs = path.join(pagesDir, page, "demo", `${name}.tsx`);
        return (
          `import * as React from "react";\n` +
          `import { Demo } from ${JSON.stringify(demoComponent)};\n` +
          `import Component from ${JSON.stringify(abs)};\n` +
          // Memoized: DemoCodeLoader unwraps the promise with React.use, which
          // wants a stable identity (dynamic import mints a new promise per call).
          `let p;\n` +
          `const code = () => (p ??= import(${JSON.stringify(DEMO_CODE + key)}));\n` +
          `export default function WrappedDemo(props) {\n` +
          `  return React.createElement(Demo, { code }, React.createElement(Component, props));\n` +
          `}\n`
        );
      }
      if (id.startsWith(RESOLVED_CODE)) {
        const key = id.slice(RESOLVED_CODE.length);
        const page = key.slice(0, key.indexOf("/"));
        const name = key.slice(key.indexOf("/") + 1);
        const dir = path.join(pagesDir, page, "demo");
        const rels = collectDemoFiles(dir, `${name}.tsx`);
        // The entry tsx usually imports its sibling css; add it if it didn't.
        const style = `${name}.css`;
        if (!rels.includes(style) && fs.existsSync(path.join(dir, style))) rels.push(style);
        const out = [];
        for (const rel of rels) {
          const abs = path.join(dir, rel);
          this.addWatchFile(abs);
          const code = fs.readFileSync(abs, "utf8");
          out.push({
            name: rel,
            code,
            html: await codeToHtml(code.replace(/\n$/, ""), {
              lang: path.extname(rel).slice(1) as BundledLanguage,
              themes: SHIKI_THEMES,
              defaultColor: false,
            }),
          });
        }
        return `export const FILES = ${JSON.stringify(out)};\n`;
      }
      if (id.startsWith(DEMO_CSS)) {
        const cssPath = id.slice(DEMO_CSS.length, -".js".length);
        this.addWatchFile(cssPath);
        return demoCssToImports(cssPath);
      }
    },
    // Dev: any demo-file edit invalidates that page's code modules so the source
    // tabs re-highlight (tsx edits ride plugin-rsc's own server HMR; css HMR
    // wouldn't re-render RSC, so css/manifest changes force a full reload).
    configureServer(server) {
      server.watcher.on("all", (_event, file) => {
        if (!file.startsWith(pagesDir)) return;
        const isPkg = file.endsWith("package.json");
        if (!isPkg && !/[\\/]demo[\\/]/.test(file)) return;
        const page = path.relative(pagesDir, file).split(path.sep)[0];
        // Facades invalidate too: their memoized code promises would otherwise
        // keep serving the stale module after a demo-file edit.
        const ids = [...facadeIdsForPage(page), ...codeIdsForPage(page)];
        for (const env of Object.values(server.environments)) {
          for (const id of ids) {
            const mod = env.moduleGraph.getModuleById(id);
            if (mod) env.moduleGraph.invalidateModule(mod);
          }
        }
        if (isPkg || file.endsWith(".css")) server.ws.send({ type: "full-reload" });
      });
    },
  };
}

// Prerenders every static path to plain .html after the RSC build, so
// dist/client is a fully static site; `vite preview` serves it with no server.
function ssgPlugin(): Plugin {
  return {
    name: "md3:ssg",
    config: {
      order: "pre",
      handler(_config, env) {
        return {
          appType: env.isPreview ? "mpa" : undefined,
          rsc: { serverHandler: env.isPreview ? false : undefined },
        };
      },
    },
    buildApp: {
      async handler(builder) {
        await renderStatic(builder.config);
      },
    },
  };
}

async function renderStatic(config: ResolvedConfig) {
  // Import the built rsc entry and render each static path to HTML.
  const entryPath = path.join(config.environments.rsc.build.outDir, "index.js");
  const entry: typeof import("./src/framework/entry.rsc") = await import(
    pathToFileURL(entryPath).href
  );

  const outDir = config.environments.client.build.outDir;
  for (const staticPath of entry.getStaticPaths()) {
    config.logger.info(`[md3:ssg] rendering ${staticPath}`);
    const { html, rsc: payload } = await entry.handleSsg(
      new Request(new URL(staticPath, "http://ssg.local")),
    );
    // Each route gets its HTML plus its RSC payload for client soft navigation.
    // "/dir/" routes emit dir/index.{html,rsc}; slashless routes emit
    // <path>.{html,rsc} (hosts resolve the extensionless URL via .html).
    const base = staticPath.endsWith("/") ? `${staticPath}index` : staticPath;
    await writeStream(path.join(outDir, `${base}.html`), html);
    await writeStream(path.join(outDir, `${base}.rsc`), payload);
  }
}

async function writeStream(filePath: string, stream: ReadableStream<Uint8Array>) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(
    filePath,
    Readable.fromWeb(stream as import("node:stream/web").ReadableStream),
  );
}

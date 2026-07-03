import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";
import { transformerStyleToClass } from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineHastPlugin } from "satteri";
import { type BundledLanguage, codeToHast, codeToHtml } from "shiki";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import satteri from "vite-plugin-satteri";

// Library aliases live in tsconfig.json "paths" (single source of truth).
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
    hastPlugins: [alertsHastPlugin(), shikiHastPlugin()],
  });
  const transform = base.transform as (
    this: unknown,
    code: string,
    id: string,
  ) => Promise<{ code: string; map: null } | null>;
  return {
    ...base,
    transform(code, id) {
      if (id.startsWith("\0") || id.includes("virtual:")) return null;
      return transform.call(this, code, id);
    },
  };
}

// One theme pair for fenced MDX blocks and demo source tabs alike. Light is
// github-light-default: material-theme-lighter's oranges/teals fall well below
// WCAG AA contrast on the surface-container background.
const SHIKI_THEMES = { light: "github-light-default", dark: "github-dark-dimmed" };

// Token styles live in classes, not inline vars: transformerStyleToClass emits
// content-hashed (build-stable) class names; the tiny generated stylesheet ships
// as a React-hoistable <style href precedence> so identical palettes dedupe by
// href across blocks/pages and survive SSG, streaming, and soft navigation.
const shikiClassTransformer = () => transformerStyleToClass({ classPrefix: "sk-" });
function shikiCssHref(css: string) {
  return "shiki-" + createHash("sha256").update(css).digest("hex").slice(0, 8);
}
function shikiStyleNode(css: string) {
  return {
    type: "element" as const,
    tagName: "style",
    properties: { href: shikiCssHref(css), precedence: "md3-shiki" },
    children: [{ type: "text" as const, value: css }],
  };
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
        const toClass = shikiClassTransformer();
        const hast = await codeToHast(ctx.textContent(code).replace(/\n$/, ""), {
          lang,
          themes: SHIKI_THEMES,
          defaultColor: false,
          transformers: [toClass],
        });
        const pre = hast.children[0];
        if (pre.type === "element") pre.properties["data-language"] = lang;
        // This block's class rules ride along as a hoistable style sibling.
        const css = toClass.getCSS();
        if (css) ctx.insertAfter(node, shikiStyleNode(css));
        return toReactProps(pre);
      },
    },
  });
}

// Shiki emits HTML attribute names; rename them so the compiled JSX gets React props.
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

// Standalone demos: each src/pages/<page>/demo/ folder is a drop-in package whose
// package.json `exports` lists the demo files (default export = the demo) and whose
// `description` is the demo title. This plugin scans those manifests and serves them
// as the `virtual:md3-demos` registry — "<page>/<export>" → { title, lazy loader } —
// consumed by the <Demo of="…"> server component. Demo files import the library by
// its published specifiers (incl. styles.css), so a folder copies out of the repo
// verbatim; the docs aliases above just redirect those imports to library source.
function demosPlugin(): Plugin {
  const pagesDir = path.resolve(import.meta.dirname, "src/pages");
  const VIRTUAL = "virtual:md3-demos";
  const RESOLVED = "\0" + VIRTUAL;

  function buildRegistry() {
    const entries: string[] = [];
    for (const page of fs.readdirSync(pagesDir, { withFileTypes: true })) {
      if (!page.isDirectory()) continue;
      const pkgPath = path.join(pagesDir, page.name, "demo", "package.json");
      if (!fs.existsSync(pkgPath)) continue;
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
        description?: string;
        exports?: Record<string, string | { style?: string; default: string }>;
      };
      // Export values are conditional: `default` is the demo module, `style`
      // its stylesheet (docs-resolved to the shared stub; see resolveId).
      for (const [subpath, target] of Object.entries(pkg.exports ?? {})) {
        const id = `${page.name}/${subpath.replace(/^\.\//, "")}`;
        const files = typeof target === "string" ? { default: target } : target;
        for (const file of Object.values(files)) {
          if (!fs.existsSync(path.join(pagesDir, page.name, "demo", file))) {
            throw new Error(`[md3:demos] ${pkgPath} export "${subpath}" points to missing ${file}`);
          }
        }
        const abs = path.join(pagesDir, page.name, "demo", files.default);
        // code memoizes its promise: DemoCodeLoader unwraps it with React.use, which
        // wants a stable identity (dynamic import mints a new promise per call).
        entries.push(
          `  ${JSON.stringify(id)}: { title: ${JSON.stringify(pkg.description ?? id)}, ` +
            `load: () => import(${JSON.stringify(abs)}), ` +
            `code: (p => () => (p ??= import(${JSON.stringify(DEMO_CODE + id)})))() }`,
        );
      }
    }
    return `export const DEMOS = {\n${entries.join(",\n")}\n};\n`;
  }

  // Per-demo source-code module: reads the demo's entry file, its relative imports,
  // and the export's style css, Shiki-highlights each at compile time, and exports
  // FILES = [{ name, code, html }] for the <Demo> code tabs. Zero client JS.
  const DEMO_CODE = "virtual:md3-demo-code:";
  const RESOLVED_CODE = "\0" + DEMO_CODE;
  const codeIdsForPage = (page: string) => {
    const pkgPath = path.join(pagesDir, page, "demo", "package.json");
    if (!fs.existsSync(pkgPath)) return [];
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
      exports?: Record<string, unknown>;
    };
    return Object.keys(pkg.exports ?? {}).map(
      (sub) => RESOLVED_CODE + `${page}/${sub.replace(/^\.\//, "")}`,
    );
  };

  // Pages import Demo from "./demo" (the sibling demo folder): that resolves to
  // a generated page-scoped wrapper, so `of` is relative to the page —
  // <Demo of="states" /> inside pages/switch/ means "switch/states".
  const SCOPED = "\0md3-demo-scope:";
  const demoComponent = path.resolve(import.meta.dirname, "src/components/demo.tsx");

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
    // Pre: "./demo" is a real directory, so the default resolver would try (and
    // fail) to resolve it as a package before this plugin gets a look.
    enforce: "pre",
    resolveId(id, importer) {
      if (id === VIRTUAL) return RESOLVED;
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
      if (id === "./demo") {
        const page = path.relative(pagesDir, importer).split(path.sep)[0];
        if (fs.existsSync(path.join(pagesDir, page, "demo", "package.json"))) {
          return SCOPED + page;
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
      if (id === RESOLVED) return buildRegistry();
      if (id.startsWith(RESOLVED_CODE)) {
        const key = id.slice(RESOLVED_CODE.length);
        const page = key.slice(0, key.indexOf("/"));
        const sub = "./" + key.slice(key.indexOf("/") + 1);
        const dir = path.join(pagesDir, page, "demo");
        const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")) as {
          exports?: Record<string, string | { style?: string; default: string }>;
        };
        const target = pkg.exports?.[sub];
        if (!target) throw new Error(`[md3:demos] no export "${sub}" in ${page}'s demo package`);
        const files = typeof target === "string" ? { default: target } : target;
        const rels = collectDemoFiles(dir, files.default.replace(/^\.\//, ""));
        // The entry tsx usually imports its css; add the manifest style if it didn't.
        const style = files.style?.replace(/^\.\//, "");
        if (style && !rels.includes(style)) rels.push(style);
        const toClass = shikiClassTransformer(); // shared: one deduped sheet per demo
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
              transformers: [toClass],
            }),
          });
        }
        const css = toClass.getCSS();
        return (
          `export const FILES = ${JSON.stringify(out)};\n` +
          `export const CSS = ${JSON.stringify(css)};\n` +
          `export const CSS_HREF = ${JSON.stringify(shikiCssHref(css))};\n`
        );
      }
      if (id.startsWith(DEMO_CSS)) {
        const cssPath = id.slice(DEMO_CSS.length, -".js".length);
        this.addWatchFile(cssPath);
        return demoCssToImports(cssPath);
      }
      if (id.startsWith(SCOPED)) {
        const page = id.slice(SCOPED.length);
        return (
          `import * as React from "react";\n` +
          `import { Demo as Base } from ${JSON.stringify(demoComponent)};\n` +
          `export function Demo({ of, ...props }) {\n` +
          `  return React.createElement(Base, { of: ${JSON.stringify(page + "/")} + of, ...props });\n` +
          `}\n`
        );
      }
    },
    // Dev: a demo manifest edit re-scans the registry; any demo-file edit
    // invalidates that page's code modules so the source tabs re-highlight
    // (tsx edits ride plugin-rsc's own server HMR; css HMR wouldn't re-render
    // RSC, so css/manifest changes force a full reload).
    configureServer(server) {
      server.watcher.on("all", (_event, file) => {
        if (!file.startsWith(pagesDir)) return;
        const isPkg = file.endsWith("package.json");
        if (!isPkg && !/[\\/]demo[\\/]/.test(file)) return;
        const page = path.relative(pagesDir, file).split(path.sep)[0];
        // Registry always invalidates too: its memoized code() promises would
        // otherwise keep serving the stale module after a demo-file edit.
        const ids = [RESOLVED, ...codeIdsForPage(page)];
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

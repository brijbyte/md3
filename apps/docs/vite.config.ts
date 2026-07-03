import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineHastPlugin } from "satteri";
import { codeToHast } from "shiki";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import satteri from "vite-plugin-satteri";

// Library aliases live in tsconfig.json "paths" (single source of truth).
export default defineConfig({
  plugins: [
    mdxPlugin(),
    tailwindcss(),
    react(),
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
    hastPlugins: [shikiHastPlugin()],
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
          themes: { light: "material-theme-lighter", dark: "material-theme-darker" },
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
        entries.push(
          `  ${JSON.stringify(id)}: { title: ${JSON.stringify(pkg.description ?? id)}, ` +
            `load: () => import(${JSON.stringify(abs)}) }`,
        );
      }
    }
    return `export const DEMOS = {\n${entries.join(",\n")}\n};\n`;
  }

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
    return imports.join("\n") + "\n";
  }

  return {
    name: "md3:demos",
    // Pre: "./demo" is a real directory, so the default resolver would try (and
    // fail) to resolve it as a package before this plugin gets a look.
    enforce: "pre",
    resolveId(id, importer) {
      if (id === VIRTUAL) return RESOLVED;
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
    load(id) {
      if (id === RESOLVED) return buildRegistry();
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
    // Dev: a demo manifest edit re-scans the registry in every RSC environment.
    configureServer(server) {
      server.watcher.on("all", (_event, file) => {
        if (!file.startsWith(pagesDir) || !file.endsWith("package.json")) return;
        for (const env of Object.values(server.environments)) {
          const mod = env.moduleGraph.getModuleById(RESOLVED);
          if (mod) env.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
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

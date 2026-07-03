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
    layerPinPlugin(),
    ssgPlugin(),
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
        return toReactProps(hast.children[0]);
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

// The cascade-layer order pin only holds if it's parsed before any @layer block, but
// plugin-rsc's client-reference stylesheets can precede app.css in the head (React
// emits precedence groups in first-encounter order, which varies per page). Prepend
// the pin to every CSS asset so link order can never change layer order.
function layerPinPlugin(): Plugin {
  const pin = "@layer theme, base, md3.tokens, md3.components, components, utilities;\n";
  return {
    name: "md3:layer-pin",
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) continue;
        asset.source =
          typeof asset.source === "string"
            ? pin + asset.source
            : pin + new TextDecoder().decode(asset.source);
      }
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

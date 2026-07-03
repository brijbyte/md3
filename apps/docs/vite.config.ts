import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";

// Library aliases live in tsconfig.json "paths" (single source of truth).
export default defineConfig({
  plugins: [
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
  ],
  resolve: {
    tsconfigPaths: true,
  },
  environments: {
    client: {
      optimizeDeps: {
        // Client components are only reached through the RSC graph, which the
        // dep scanner doesn't crawl; scanning all of src pre-bundles @base-ui/*
        // so dev doesn't re-optimize (and reload) mid-hydration.
        entries: ["./src/**/*.tsx"],
      },
    },
  },
});

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
  for (const staticPath of await entry.getStaticPaths()) {
    config.logger.info(`[md3:ssg] rendering ${staticPath}`);
    const { html, rsc: payload } = await entry.handleSsg(
      new Request(new URL(staticPath, "http://ssg.local")),
    );
    // Each route gets its HTML plus its RSC payload for client soft navigation.
    const dir = staticPath.endsWith("/") ? staticPath : `${staticPath}/`;
    const htmlFile = path.join(outDir, dir, "index.html");
    await writeStream(htmlFile, html);
    await writeStream(path.join(outDir, dir, "index.rsc"), payload);
    // Routes are slashless (/buttons): also emit buttons.html so static hosts
    // resolve the extensionless URL directly (sirv, GitHub Pages, …).
    if (staticPath !== "/") {
      await fs.promises.copyFile(htmlFile, path.join(outDir, `${staticPath}.html`));
    }
  }
}

async function writeStream(filePath: string, stream: ReadableStream<Uint8Array>) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(
    filePath,
    Readable.fromWeb(stream as import("node:stream/web").ReadableStream),
  );
}

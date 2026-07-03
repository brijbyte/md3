import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import DtsCreatorImport from "typed-css-modules";
import { buildTokens, tokensJsonPath, tokensCssPath } from "./scripts/build-tokens.mjs";

const abs = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const DtsCreator: any = (DtsCreatorImport as any).default ?? DtsCreatorImport;

// Codegen (tokens.json → tokens.css/ts, *.module.css → .d.ts) as part of the
// build so `vite build --watch` regenerates on change.
function md3Codegen(): Plugin {
  const cssCreator = new DtsCreator();
  const genCssTypes = async (file: string) => {
    const content = await cssCreator.create(file);
    await content.writeFile();
  };

  return {
    name: "md3:codegen",
    async buildStart() {
      buildTokens();
      this.addWatchFile(tokensJsonPath);
      await Promise.all(globSync(abs("src/**/*.module.css")).map(genCssTypes));
    },
    async watchChange(id) {
      if (id === tokensJsonPath) buildTokens();
      else if (id.endsWith(".module.css")) await genCssTypes(id);
    },
  };
}

// Emits tokens.css + ripple.css as standalone assets (they're no longer
// side-effect imports in src) and aggregates everything into dist/index.css.
function md3EmitCss(): Plugin {
  return {
    name: "md3:emit-css",
    generateBundle(_options, bundle) {
      const tokensCss = readFileSync(tokensCssPath, "utf8");
      const rippleCss = readFileSync(abs("src/ripple/ripple.css"), "utf8");
      this.emitFile({
        type: "asset",
        fileName: "styles/tokens.css",
        source: tokensCss,
      });
      this.emitFile({
        type: "asset",
        fileName: "styles/ripple.css",
        source: rippleCss,
      });

      // Tokens first to establish @layer order, ripple next, then components.
      const componentCss = Object.keys(bundle)
        .filter((name) => name.endsWith(".css"))
        .toSorted()
        .map((name) => {
          const asset = bundle[name];
          return asset.type === "asset" ? asset.source : "";
        });
      this.emitFile({
        type: "asset",
        fileName: "index.css",
        source: [tokensCss, rippleCss, ...componentCss].join("\n"),
      });
    },
  };
}

// Rollup strips module-level directives when bundling; strip them ourselves
// (avoids the warning) and re-add 'use client' to chunks that need it for RSC.
function preserveUseClient(): Plugin {
  const clientModules = new Set<string>();
  return {
    name: "md3:preserve-use-client",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("/src/") && /^(['"])use client\1/.test(code)) {
        clientModules.add(id);
        return {
          code: code.replace(/^(['"])use client\1;?\s*/, ""),
          map: null,
        };
      }
    },
    renderChunk(code, chunk) {
      if (chunk.moduleIds.some((id) => clientModules.has(id))) {
        return { code: `'use client';\n${code}`, map: null };
      }
    },
  };
}

export default defineConfig({
  plugins: [
    md3Codegen(),
    preserveUseClient(),
    react(),
    dts({ tsconfigPath: "./tsconfig.lib.json" }),
    md3EmitCss(),
  ],
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        "button/index": "src/button/index.ts",
        "icon-button/index": "src/icon-button/index.ts",
        "fab/index": "src/fab/index.ts",
        "checkbox/index": "src/checkbox/index.ts",
        "radio/index": "src/radio/index.ts",
        "switch/index": "src/switch/index.ts",
      },
      formats: ["es"],
    },
    cssCodeSplit: true,
    rollupOptions: {
      external: [/^react/, /^@base-ui\//],
      output: {
        assetFileNames: "styles/[name][extname]",
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
  css: {
    modules: {
      // Readable, stable class names — part of the public styling contract.
      generateScopedName: "md3-[folder]-[local]",
    },
  },
});

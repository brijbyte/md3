import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import DtsCreatorImport from "typed-css-modules";
import {
  buildTokens,
  tailwindTokensCssPath,
  tokensCssPath,
  tokensJsonPath,
} from "./scripts/build-tokens.mjs";

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
    generateBundle: {
      // Post-order: run after Vite's internal CSS plugin has finalized assets,
      // so renames stick and the size report shows the final names.
      order: "post",
      handler(_options, bundle) {
        // cssCodeSplit names extracted CSS after the source module (e.g.
        // styles/button/Button.css). Flatten to styles/<component>.css.
        // (Rolldown only supports deleting bundle entries, not adding — so
        // re-emit under the new name instead of reassigning fileName.)
        const componentCss = new Map<string, string>();
        for (const chunk of Object.values(bundle)) {
          if (chunk.type !== "chunk" || !chunk.viteMetadata) continue;
          const component = chunk.name.split("/")[0];
          for (const cssName of chunk.viteMetadata.importedCss) {
            const asset = bundle[cssName];
            if (!asset || asset.type !== "asset") continue;
            delete bundle[cssName];
            componentCss.set(component, String(asset.source));
            this.emitFile({
              type: "asset",
              fileName: `styles/${component}.css`,
              source: asset.source,
            });
          }
        }

        const tokensCss = readFileSync(tokensCssPath, "utf8");
        this.emitFile({
          type: "asset",
          fileName: "styles/tokens.css",
          source: tokensCss,
        });
        // Tailwind-only theme file: shipped standalone, never in the aggregate
        // (raw @theme is only meaningful inside a consumer's Tailwind build).
        this.emitFile({
          type: "asset",
          fileName: "styles/tailwind-tokens.css",
          source: readFileSync(tailwindTokensCssPath, "utf8"),
        });

        // Tokens first to establish @layer order, ripple next, then components.
        const rippleCss = componentCss.get("ripple") ?? "";
        const sortedComponentCss = [...componentCss.keys()]
          .filter((name) => name !== "ripple")
          .toSorted()
          .map((name) => componentCss.get(name)!);
        this.emitFile({
          type: "asset",
          fileName: "index.css",
          source: [tokensCss, rippleCss, ...sortedComponentCss].join("\n"),
        });
      },
    },
  };
}

export default defineConfig({
  plugins: [md3Codegen(), react(), dts({ tsconfigPath: "./tsconfig.lib.json" }), md3EmitCss()],
  build: {
    minify: false,
    lib: {
      entry: {
        "tokens/index": "src/tokens/index.ts",
        "button/index": "src/button/index.ts",
        "button-group/index": "src/button-group/index.ts",
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
        // Mirror src/ in dist/ (no bundling) so 'use client' is re-added per
        // module — server-safe re-export index files stay directive-free.
        preserveModules: true,
        preserveModulesRoot: "src",
        assetFileNames: "styles/[name][extname]",
        entryFileNames: "[name].js",
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

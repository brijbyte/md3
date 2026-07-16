import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";
import DtsCreatorImport from "typed-css-modules";
import { buildTokens } from "./scripts/build-tokens.mjs";
import { buildLoadingIndicatorShapes } from "./scripts/build-loading-indicator-shapes.mjs";
import { buildCircularProgressShapes } from "./scripts/build-circular-progress-shapes.mjs";
import { emitCss } from "./scripts/emit-css.mjs";
import { emitCssModuleDts } from "./scripts/build-css-module-dts.mjs";

const abs = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const DtsCreator: any = (DtsCreatorImport as any).default ?? DtsCreatorImport;

// Codegen (tokens.json → tokens.css/ts, shapes, *.module.css → .d.ts) so the
// bundle + dts pass see fresh generated sources; `--watch` reruns it per build.
async function codegen() {
  buildTokens();
  buildLoadingIndicatorShapes();
  buildCircularProgressShapes();
  const creator = new DtsCreator();
  await Promise.all(
    globSync(abs("src/**/*.module.css")).map(async (file) => {
      const content = await creator.create(file);
      await content.writeFile();
    }),
  );
}

export default defineConfig({
  entry: {
    "badge/index": "src/badge/index.ts",
    "bottom-sheet/index": "src/bottom-sheet/index.ts",
    "button-group/index": "src/button-group/index.ts",
    "button/index": "src/button/index.ts",
    "card/index": "src/card/index.ts",
    "checkbox/index": "src/checkbox/index.ts",
    "chip/index": "src/chip/index.ts",
    "circular-progress/index": "src/circular-progress/index.ts",
    "dialog/index": "src/dialog/index.ts",
    "divider/index": "src/divider/index.ts",
    "fab-menu/index": "src/fab-menu/index.ts",
    "fab/index": "src/fab/index.ts",
    "icon-button/index": "src/icon-button/index.ts",
    "linear-progress/index": "src/linear-progress/index.ts",
    "list/index": "src/list/index.ts",
    "loading-indicator/index": "src/loading-indicator/index.ts",
    "menu/index": "src/menu/index.ts",
    "radio/index": "src/radio/index.ts",
    "select/index": "src/select/index.ts",
    "side-sheet/index": "src/side-sheet/index.ts",
    "slider/index": "src/slider/index.ts",
    "snackbar/index": "src/snackbar/index.ts",
    "split-button/index": "src/split-button/index.ts",
    "switch/index": "src/switch/index.ts",
    "tabs/index": "src/tabs/index.ts",
    "text-field/index": "src/text-field/index.ts",
    "tokens/index": "src/tokens/index.ts",
    "toolbar/index": "src/toolbar/index.ts",
    "tooltip/index": "src/tooltip/index.ts",
    "typography/index": "src/typography/index.ts",
  },
  format: ["es"],
  // Mirror src/ in dist/ (no bundling) so 'use client' is re-added per module —
  // server-safe re-export index files stay directive-free.
  unbundle: true,
  target: "es2022",
  platform: "neutral",
  minify: false,
  clean: true,
  dts: { tsconfig: "./tsconfig.lib.json" },
  deps: { neverBundle: [/^react/, /^@base-ui\//] },
  css: {
    transformer: "postcss",
    splitting: true,
    modules: {
      // Readable, stable class names (md3-button-root) — public styling contract.
      generateScopedName: (name: string, filename: string) => {
        const folder = filename.replace(/\\/g, "/").split("/").at(-2);
        return `md3-${folder}-${name}`;
      },
    },
  },
  hooks: {
    "build:prepare": codegen,
    "build:done": async () => {
      emitCss();
      await emitCssModuleDts();
    },
  },
  logLevel: "warn",
});

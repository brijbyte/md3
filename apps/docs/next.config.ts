import path from "node:path";
import type { NextConfig } from "next";
import { buildIconData } from "./scripts/build-icon-data.mjs";
import { seedSearchIndex } from "./scripts/build-search-index.mjs";
import { buildShikiTheme } from "./scripts/build-shiki-theme.mjs";

const ROOT = import.meta.dirname;

const HAST_PLUGINS = path.join(ROOT, "satteri/hast-plugins.mjs");

// Magic specifier satteri's output imports `useMDXComponents` from; aliased to
// our provider below (we wire the loaders ourselves instead of withSatteri, so
// the alias is ours to manage too).
const PROVIDER_SPECIFIER = "next-mdx-import-source-file";

const SATTERI_LOADER = {
  loader: "satteri-nextjs/loader",
  options: {
    features: { gfm: true, frontmatter: true, directive: true },
    // Factories referenced by string spec so they resolve under both bundlers;
    // per-document state (the heading id chain) resets per compile.
    hastPlugins: [
      `${HAST_PLUGINS}#headingIds`,
      `${HAST_PLUGINS}#stripTableWhitespace`,
      `${HAST_PLUGINS}#alerts`,
      `${HAST_PLUGINS}#externalLinks`,
      `${HAST_PLUGINS}#shiki`,
    ],
    // Per-node JSX (no static-HTML collapse): the mdx-components provider must
    // restyle base tags (p, h2, pre, …) with the MD3 element map.
    optimizeStatic: false,
    providerImportSource: PROVIDER_SPECIFIER,
    frontmatter: true,
  },
};
const DEMO_LOADER = {
  loader: path.join(ROOT, "loaders/demo-loader.mjs"),
  options: {
    createDemo: path.join(ROOT, "src/components/create-demo.tsx"),
    // Highlighted demo sources land here (gitignored), fetched on "Show code".
    outDir: path.join(ROOT, "public/demo-code"),
    // Cache-buster: bump to invalidate Turbopack's persisted loader results
    // (they key on options, not on the loader source).
    version: 3,
  },
};
// Runs after satteri (loaders apply right-to-left) to fix its .js-rewritten
// relative import specifiers back to the on-disk .tsx/.ts files.
const RESTORE_EXTENSIONS_LOADER = { loader: path.join(ROOT, "loaders/restore-extensions.mjs") };
// Last in the chain = runs first, on the raw MDX source: refreshes the page's
// search-index fragment (see scripts/build-search-index.mjs), passes source through.
const SEARCH_INDEX_LOADER = { loader: path.join(ROOT, "loaders/search-index-loader.mjs") };

// Async config: the pre-build codegen runs (concurrently) before Next starts.
export default async function nextConfig(): Promise<NextConfig> {
  const [searchIndexUrl] = await Promise.all([
    seedSearchIndex(),
    buildIconData(),
    buildShikiTheme(),
  ]);

  return {
    output: "export",
    trailingSlash: false,
    pageExtensions: ["tsx", "mdx"],
    env: { NEXT_PUBLIC_SEARCH_INDEX_URL: searchIndexUrl },
    turbopack: {
      resolveAlias: { [PROVIDER_SPECIFIER]: "./src/mdx-components.tsx" },
      rules: {
        "*.mdx": {
          loaders: [RESTORE_EXTENSIONS_LOADER, SATTERI_LOADER, SEARCH_INDEX_LOADER],
          as: "*.js",
        },
        "./src/app/**/demo/*.tsx": { loaders: [DEMO_LOADER] },
      },
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  };
}

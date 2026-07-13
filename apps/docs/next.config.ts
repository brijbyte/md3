import path from "node:path";
import type { NextConfig } from "next";
import { buildIconData } from "./scripts/build-icon-data.mjs";

// Generate the icon-browser data (gitignored public/icons-data/) before the
// build/dev server starts, so the icons page works on a fresh clone. Skips
// work when the data is newer than the icons dist (see build-icon-data.mjs).
buildIconData();

const ROOT = import.meta.dirname;

// .mdx → server-safe JS via Sätteri (satteri-nextjs/loader); page.mdx files
// under app/ ARE the routes (mdx is in pageExtensions below). Demo sources
// (src/app/**/demo/*.tsx) are wrapped in the <Demo> chrome by our demo
// loader at their own modules (see loaders/demo-loader.mjs) — pages import
// and render demos directly, untransformed. All loader options are
// JSON-serializable so the same pipeline applies under webpack and Turbopack.
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
    version: 1,
  },
};
// Runs after satteri (loaders apply right-to-left) to fix its .js-rewritten
// relative import specifiers back to the on-disk .tsx/.ts files.
const RESTORE_EXTENSIONS_LOADER = { loader: path.join(ROOT, "loaders/restore-extensions.mjs") };

const nextConfig: NextConfig = {
  // Fully static site: every route prerenders to out/<path>.html (+ its RSC
  // payload for soft navigation), same hosting shape as the old Vite SSG.
  output: "export",
  trailingSlash: false,
  pageExtensions: ["tsx", "mdx"],
  turbopack: {
    resolveAlias: { [PROVIDER_SPECIFIER]: "./src/mdx-components.tsx" },
    rules: {
      "*.mdx": { loaders: [RESTORE_EXTENSIONS_LOADER, SATTERI_LOADER], as: "*.js" },
      "./src/app/**/demo/*.tsx": { loaders: [DEMO_LOADER] },
    },
  },
};

export default nextConfig;

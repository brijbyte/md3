import path from "node:path";
import type { NextConfig } from "next";
import { buildIconData } from "./scripts/build-icon-data.mjs";

// Generate the icon-browser data (gitignored public/icons-data/) before the
// build/dev server starts, so the icons page works on a fresh clone. Skips
// work when the data is newer than the icons dist (see build-icon-data.mjs).
buildIconData();

const ROOT = import.meta.dirname;

// .mdx → server-safe JS via Sätteri (satteri-nextjs/loader), then our demo
// loader wraps page-imported demos in the <Demo> chrome. Loaders run
// right-to-left under both bundlers, and all options are JSON-serializable so
// the same pipeline applies under webpack and Turbopack. MDX files are content
// modules imported by app-router pages — never routes — so pageExtensions
// stays default and no page.mdx is ever picked up from app/.
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
    // The built-in toc collector runs after headingIds and respects its ids,
    // so each page's `toc` export carries the chained anchor ids.
    toc: true,
    frontmatter: true,
  },
};
const DEMO_LOADER = {
  loader: path.join(ROOT, "loaders/demo-loader.mjs"),
  options: { createDemo: path.join(ROOT, "src/components/create-demo.tsx") },
};

const nextConfig: NextConfig = {
  // Fully static site: every route prerenders to out/<path>.html (+ its RSC
  // payload for soft navigation), same hosting shape as the old Vite SSG.
  output: "export",
  trailingSlash: false,
  turbopack: {
    resolveAlias: { [PROVIDER_SPECIFIER]: "./src/mdx-components.tsx" },
    rules: {
      "*.mdx": { loaders: [DEMO_LOADER, SATTERI_LOADER], as: "*.js" },
    },
  },
};

export default nextConfig;

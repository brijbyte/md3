// Server component owning the HTML document (replaces index.html).
// app.css @imports the library CSS; cascade-layer order is pinned by the
// md3:layer-order plugin (vite.config), which prepends it to every stylesheet.
import "./app.css";

import * as React from "react";
import { LoadingIndicator } from "@brijbyte/md3-react/loading-indicator";
import { Typography } from "@brijbyte/md3-react/typography";
import { NAV, SECTIONS, type NavItem } from "./nav";
import { MDX_COMPONENTS } from "./components/mdx-components";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toc, type TocItem } from "./components/toc";

type MdxModule = {
  default: React.ComponentType<{ components?: Record<string, React.ElementType> }>;
  toc: TocItem[];
};

// One route entry per page: the page component plus (for MDX pages) its
// floating table of contents, both lazy off the same module/chunk.
type PageEntry = { Page: React.ComponentType; PageToc?: React.ComponentType };

// MDX pages compile to plain server components; inject the MD3-styled
// markdown element map here so .mdx files never have to. The compiled module
// also exports its heading outline (vite.config's mdxPlugin), rendered as the
// TOC beside the page.
function mdxRoute(load: () => Promise<MdxModule>): PageEntry {
  return {
    Page: React.lazy(async () => {
      const { default: Content } = await load();
      return { default: () => <Content components={MDX_COMPONENTS} /> };
    }),
    PageToc: React.lazy(async () => {
      const { toc } = await load();
      return { default: () => <Toc items={toc} /> };
    }),
  };
}

// React.lazy works in server components too: each page becomes its own server
// chunk, loaded only when its route renders. During SSG, prerender() waits for
// the lazy import to resolve, so the static HTML is still complete.
const PAGES: Record<string, PageEntry> = {
  "/": { Page: React.lazy(() => import("./pages/home")) },
  "/overview/getting-started": mdxRoute(() => import("./pages/getting-started/page.mdx")),
  "/overview/integration": mdxRoute(() => import("./pages/integration/page.mdx")),
  "/styles/typography": mdxRoute(() => import("./pages/typography/page.mdx")),
  "/components/buttons": mdxRoute(() => import("./pages/buttons/page.mdx")),
  "/components/badge": mdxRoute(() => import("./pages/badge/page.mdx")),
  "/components/bottom-sheet": mdxRoute(() => import("./pages/bottom-sheet/page.mdx")),
  "/components/side-sheet": mdxRoute(() => import("./pages/side-sheet/page.mdx")),
  "/components/card": mdxRoute(() => import("./pages/card/page.mdx")),
  "/components/chips": mdxRoute(() => import("./pages/chips/page.mdx")),
  "/components/checkbox": mdxRoute(() => import("./pages/checkbox/page.mdx")),
  "/components/loading-indicator": mdxRoute(() => import("./pages/loading-indicator/page.mdx")),
  "/components/menu": mdxRoute(() => import("./pages/menu/page.mdx")),
  "/components/progress-indicator": mdxRoute(() => import("./pages/progress-indicator/page.mdx")),
  "/components/radio": mdxRoute(() => import("./pages/radio/page.mdx")),
  "/components/slider": mdxRoute(() => import("./pages/slider/page.mdx")),
  "/components/snackbar": mdxRoute(() => import("./pages/snackbar/page.mdx")),
  "/components/switch": mdxRoute(() => import("./pages/switch/page.mdx")),
  "/components/tabs": mdxRoute(() => import("./pages/tabs/page.mdx")),
  "/components/tooltip": mdxRoute(() => import("./pages/tooltip/page.mdx")),
  "/showcase/team-tasks": {
    Page: React.lazy(() => import("./pages/showcases/team-tasks/index")),
  },
};

// The landing page renders without the docs chrome; everything else gets the
// sidebar (grouped SECTIONS on desktop, a flat chip row on mobile).
const SIDEBAR = NAV.filter((item) => item.path !== "/");

// Apply persisted theme before first paint to avoid a flash.
const themeInitScript = `
const stored = localStorage.getItem("theme");
document.documentElement.dataset.theme =
  stored === "light"
    ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
`;

function PageFallback() {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <LoadingIndicator aria-label="Loading page" />
    </div>
  );
}

export default function Root({ url }: { url: URL }) {
  // Canonical paths are slashless ("/buttons"); static hosts serve
  // buttons/index.html at "/buttons/" too, so strip the trailing slash.
  const pathname =
    url.pathname.length > 1 && url.pathname.endsWith("/")
      ? url.pathname.slice(0, -1)
      : url.pathname;
  const route = NAV.find((item) => item.path === pathname);
  const entry = PAGES[pathname];
  // Showcase pages reuse the landing (sidebar-free) layout — they're full-app
  // demos, not doc pages.
  const isLanding = pathname === "/" || pathname.startsWith("/showcase/");

  return (
    // data-theme is set by the inline script before hydration.
    // scrollbar-gutter must live on <html>: browsers propagate it to the
    // viewport only from the root element (body would only affect body's box).
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="dark"
      className="scheme-light data-[theme='dark']:scheme-dark data-navigating:cursor-progress scrollbar-gutter-stable"
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={route?.description ?? NAV[0].description} />
        <title>
          {route && route.path !== "/"
            ? `${route.title} — MD3 React`
            : "MD3 React — Material Design 3 for React"}
        </title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased bg-background text-on-background font-plain text-body-large">
        {isLanding && entry ? (
          <LandingLayout Page={entry.Page} />
        ) : (
          <DocsLayout pathname={pathname} route={route} entry={entry} url={url} />
        )}
      </body>
    </html>
  );
}

// Full-width landing: no sidebar, just a slim header and the page content.
function LandingLayout({ Page }: { Page: React.ComponentType }) {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-6 pb-24">
      <header className="flex items-center justify-between gap-4 pb-12">
        <Typography as="a" variant="title-large" href="/">
          MD3 React
        </Typography>
        <ThemeToggle />
      </header>
      <React.Suspense fallback={<PageFallback />}>
        <Page />
      </React.Suspense>
    </div>
  );
}

function DocsLayout({
  pathname,
  route,
  entry,
  url,
}: {
  pathname: string;
  route: NavItem | undefined;
  entry: PageEntry | undefined;
  url: URL;
}) {
  const { Page, PageToc } = entry ?? {};
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col p-3 md:flex">
        <Typography as="a" variant="title-large" href="/" className="shrink-0 px-4 pt-4 pb-2">
          MD3 React
        </Typography>
        <nav className="docs-nav-scroll flex flex-col overflow-y-auto" aria-label="Documentation">
          {SECTIONS.map((section) => (
            <React.Fragment key={section.label}>
              {/* MD3 nav-drawer section header. */}
              <Typography
                as="span"
                variant="title-small"
                className="px-4 pt-5 pb-2 font-brand text-on-surface-variant"
              >
                {section.label}
              </Typography>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <NavLink key={item.path} item={item} active={item.path === pathname} />
                ))}
              </div>
            </React.Fragment>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-190 px-6 pt-6 pb-24">
          <header className="flex items-center justify-between gap-4 pb-4">
            <Typography as="a" variant="title-large" href="/" className="md:hidden">
              MD3 React
            </Typography>
            <span className="hidden md:block" aria-hidden />
            <ThemeToggle />
          </header>
          <nav
            className="docs-mobile-tabs -mx-6 mb-6 flex overflow-x-auto px-6 md:hidden"
            aria-label="Documentation"
          >
            {SIDEBAR.map((item) => (
              <a
                key={item.path}
                href={item.path}
                aria-current={item.path === pathname ? "page" : undefined}
                data-active={item.path === pathname ? "" : undefined}
                className="docs-mobile-tab font-brand"
              >
                <item.icon className="docs-mobile-tab-icon" />
                {item.label}
              </a>
            ))}
          </nav>
          {/* Full-page loads render the active tab wherever it falls in the
              overflow row; nudge it into view once (scrollIntoView only
              affects this row's own scroll container, block: "nearest"
              keeps the page's vertical scroll untouched). */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "document.querySelector('.docs-mobile-tabs [data-active]')?.scrollIntoView({inline:'center',block:'nearest'});",
            }}
          />
          {route ? (
            <>
              <Typography as="h1" variant="display-small" className="font-bold" id="top">
                {route.title}
              </Typography>
              <Typography variant="title-medium" className="mt-2 mb-8 text-on-surface-variant">
                {route.description}
              </Typography>
              {Page && (
                // key: soft navigation swaps payloads in a transition, which never
                // re-shows the fallback of an existing boundary; keying by route
                // remounts the boundary so pending page content shows the fallback.
                <React.Suspense fallback={<PageFallback />}>
                  <Page />
                </React.Suspense>
              )}
            </>
          ) : (
            <>
              <Typography as="h1" variant="display-small" className="font-bold">
                Page not found
              </Typography>
              <Typography className="mt-2 text-on-surface-variant">
                Nothing lives at {url.pathname}.{" "}
                <a href="/" className="text-primary underline">
                  Back to the overview
                </a>
                .
              </Typography>
            </>
          )}
        </div>
      </div>

      {PageToc && (
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto py-22 pr-6 xl:block">
          {/* The outline rides the page's own chunk; nothing to show meanwhile. */}
          <React.Suspense>
            <PageToc />
          </React.Suspense>
        </aside>
      )}
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Typography
      as="a"
      variant="label-large"
      href={item.path}
      aria-current={active ? "page" : undefined}
      className={`flex h-14 items-center gap-3 rounded-full px-4 font-brand ${
        active
          ? "bg-secondary-container text-on-secondary-container"
          : "text-on-surface-variant hover:bg-on-surface/8"
      }`}
    >
      <item.icon className="text-2xl" />
      {item.label}
    </Typography>
  );
}

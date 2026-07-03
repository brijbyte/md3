// Server component owning the HTML document (replaces index.html).
// app.css is the single stylesheet: its first line pins the cascade-layer
// order, and it @imports the library CSS so nothing depends on link order.
import "./app.css";

import * as React from "react";
import SpinnerIcon from "@brijbyte/md3-icons/outlined/ProgressActivity";
import { NAV, SECTIONS, type NavItem } from "./nav";
import { MDX_COMPONENTS } from "./components/mdx-components";
import { ThemeToggle } from "./components/ThemeToggle";

// MDX pages compile to plain server components; inject the MD3-styled
// markdown element map here so .mdx files never have to.
function mdxPage(
  load: () => Promise<{
    default: React.ComponentType<{ components?: Record<string, React.ElementType> }>;
  }>,
): React.ComponentType {
  return React.lazy(async () => {
    const { default: Content } = await load();
    return { default: () => <Content components={MDX_COMPONENTS} /> };
  });
}

// React.lazy works in server components too: each page becomes its own server
// chunk, loaded only when its route renders. During SSG, prerender() waits for
// the lazy import to resolve, so the static HTML is still complete.
const PAGES: Record<string, React.ComponentType> = {
  "/": React.lazy(() => import("./pages/home")),
  "/overview/getting-started": mdxPage(() => import("./pages/getting-started/page.mdx")),
  "/overview/tailwind": mdxPage(() => import("./pages/tailwind/page.mdx")),
  "/components/buttons": mdxPage(() => import("./pages/buttons/page.mdx")),
  "/components/badge": mdxPage(() => import("./pages/badge/page.mdx")),
  "/components/checkbox": mdxPage(() => import("./pages/checkbox/page.mdx")),
  "/components/radio": mdxPage(() => import("./pages/radio/page.mdx")),
  "/components/switch": mdxPage(() => import("./pages/switch/page.mdx")),
  "/components/tabs": mdxPage(() => import("./pages/tabs/page.mdx")),
};

// The landing page renders without the docs chrome; everything else gets the
// sidebar (grouped SECTIONS on desktop, a flat chip row on mobile).
const SIDEBAR = NAV.filter((item) => item.path !== "/");

// Apply persisted theme before first paint to avoid a flash.
const themeInitScript = `
const stored = localStorage.getItem("theme");
document.documentElement.dataset.theme =
  stored === "dark" || stored === "light"
    ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
`;

function PageFallback() {
  return (
    <div
      className="flex min-h-96 items-center justify-center"
      role="progressbar"
      aria-label="Loading page"
    >
      {/* MD3 circular indicator: 48dp, primary color. */}
      <SpinnerIcon className="animate-spin text-5xl text-primary" />
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
  const Page = PAGES[pathname];

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
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased bg-background text-on-background font-plain text-body-large">
        {pathname === "/" && Page ? (
          <LandingLayout Page={Page} />
        ) : (
          <DocsLayout pathname={pathname} route={route} Page={Page} url={url} />
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
        <span className="font-brand text-title-large">MD3 React</span>
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
  Page,
  url,
}: {
  pathname: string;
  route: NavItem | undefined;
  Page: React.ComponentType | undefined;
  url: URL;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col overflow-y-auto p-3 md:flex">
        <a href="/" className="px-4 pt-4 pb-2 font-brand text-title-large">
          MD3 React
        </a>
        <p className="px-4 pb-4 text-body-small text-on-surface-variant">
          Material Design 3, on Base UI
        </p>
        <nav className="flex flex-col" aria-label="Documentation">
          {SECTIONS.map((section) => (
            <React.Fragment key={section.label}>
              {/* MD3 nav-drawer section header. */}
              <span className="px-4 pt-5 pb-2 text-title-small text-on-surface-variant">
                {section.label}
              </span>
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
            <a href="/" className="font-brand text-title-large md:hidden">
              MD3 React
            </a>
            <span className="hidden md:block" aria-hidden />
            <ThemeToggle />
          </header>
          <nav
            className="-mx-6 mb-6 flex gap-2 overflow-x-auto px-6 md:hidden"
            aria-label="Documentation"
          >
            {SIDEBAR.map((item) => (
              <a
                key={item.path}
                href={item.path}
                aria-current={item.path === pathname ? "page" : undefined}
                className={`flex h-10 shrink-0 items-center rounded-full px-4 text-label-large ${
                  item.path === pathname
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {route ? (
            <>
              <h1 className="font-brand text-headline-large">{route.title}</h1>
              <p className="mt-2 mb-8 text-body-large text-on-surface-variant">
                {route.description}
              </p>
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
              <h1 className="font-brand text-headline-large">Page not found</h1>
              <p className="mt-2 text-body-large text-on-surface-variant">
                Nothing lives at {url.pathname}.{" "}
                <a href="/" className="text-primary underline">
                  Back to the overview
                </a>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <a
      href={item.path}
      aria-current={active ? "page" : undefined}
      className={`flex h-14 items-center gap-3 rounded-full px-4 text-label-large ${
        active
          ? "bg-secondary-container text-on-secondary-container"
          : "text-on-surface-variant hover:bg-on-surface/8"
      }`}
    >
      <item.icon className="text-2xl" />
      {item.label}
    </a>
  );
}

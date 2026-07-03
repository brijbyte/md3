// Server component owning the HTML document (replaces index.html).
// app.css is the single stylesheet: its first line pins the cascade-layer
// order, and it @imports the library CSS so nothing depends on link order.
import "./app.css";

import * as React from "react";
import SpinnerIcon from "@brijbyte/md3-icons/outlined/progress-activity";
import { NAV, type NavItem } from "./nav";
import { ThemeToggle } from "./components/ThemeToggle";

// React.lazy works in server components too: each page becomes its own server
// chunk, loaded only when its route renders. During SSG, prerender() waits for
// the lazy import to resolve, so the static HTML is still complete.
const PAGES: Record<string, React.ComponentType> = {
  "/": React.lazy(() => import("./pages/home")),
  "/buttons": React.lazy(() => import("./pages/buttons")),
  "/icon-buttons": React.lazy(() => import("./pages/icon-buttons")),
  "/fab": React.lazy(() => import("./pages/fab")),
  "/checkbox": React.lazy(() => import("./pages/checkbox")),
  "/radio": React.lazy(() => import("./pages/radio")),
  "/switch": React.lazy(() => import("./pages/switch")),
  "/tailwind": React.lazy(() => import("./pages/tailwind")),
};

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
    <html
      lang="en"
      suppressHydrationWarning
      className="scheme-light data-[theme='dark']:scheme-dark data-navigating:cursor-progress"
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
        <div className="mx-auto flex min-h-screen max-w-7xl">
          <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col overflow-y-auto p-3 md:flex">
            <a href="/" className="px-4 pt-4 pb-2 font-brand text-title-large">
              MD3 React
            </a>
            <p className="px-4 pb-4 text-body-small text-on-surface-variant">
              Material Design 3, on Base UI
            </p>
            <nav className="flex flex-col gap-1" aria-label="Components">
              {NAV.map((item) => (
                <NavLink key={item.path} item={item} active={item.path === pathname} />
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
                aria-label="Components"
              >
                {NAV.map((item) => (
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
                    <React.Suspense
                      fallback={
                        <div
                          className="flex min-h-96 items-center justify-center"
                          role="progressbar"
                          aria-label="Loading page"
                        >
                          {/* MD3 circular indicator: 48dp, primary color. */}
                          <SpinnerIcon className="animate-spin text-5xl text-primary" />
                        </div>
                      }
                    >
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
      </body>
    </html>
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

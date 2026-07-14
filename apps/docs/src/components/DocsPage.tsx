"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Typography } from "@/ui/typography";
import { NAV } from "../nav";
import { MobileTabs } from "./MobileTabs";
import { SearchIconButton } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";
import { Toc, type TocItem } from "./toc";

// Center column + right rail of every docs route, rendered by the (docs)
// layout around the page. Client component: usePathname resolves per-route
// during prerender, so the static HTML carries the right title/description.
// The "On this page" outline is scanned from the rendered headings after
// mount (a layout can't read the page module's exports), so it only exists
// post-hydration; the rail keeps its width from the start to avoid shift.
export function DocsPage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [toc, setToc] = React.useState<TocItem[]>([]);

  React.useEffect(() => {
    const headings = contentRef.current?.querySelectorAll("h2[id], h3[id]");
    setToc(
      Array.from(headings ?? [], (h) => ({
        depth: Number(h.tagName[1]),
        value: h.textContent ?? "",
        id: h.id,
      })),
    );
  }, [pathname]);

  const route = NAV.find((item) => item.path === pathname);
  if (!route) throw new Error(`DocsPage: unknown route "${pathname}"`);
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-190 px-6 pt-6 pb-24">
          {/* Below xl the TOC rail (and its ThemeToggle) is hidden, so the
              toggle rides in this header instead. */}
          <header className="flex items-center justify-between gap-4 pb-4 xl:hidden">
            <Typography as={Link} variant="title-large" href="/" className="md:hidden">
              MD3 React
            </Typography>
            <span className="hidden md:block" aria-hidden />
            <div className="flex items-center gap-2">
              <SearchIconButton />
              <ThemeToggle />
            </div>
          </header>
          <MobileTabs />
          <Typography as="h1" variant="display-small" className="font-bold" id="top">
            {route.title}
          </Typography>
          <Typography variant="title-medium" className="mt-2 mb-8 text-on-surface-variant">
            {route.description}
          </Typography>
          <div ref={contentRef}>{children}</div>
        </div>
      </div>

      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto pt-6 pb-22 pe-6 xl:block">
        <ThemeToggle />
        {/* pt-6 + toggle + mt-6 ≈ the old py-22 offset, keeping the toc put. */}
        <div className="mt-6">
          <Toc items={toc} />
        </div>
      </aside>
    </>
  );
}

import type * as React from "react";
import Link from "next/link";
import { Typography } from "@brijbyte/md3-react/typography";
import { NAV } from "../nav";
import { MobileTabs } from "./MobileTabs";
import { ThemeToggle } from "./ThemeToggle";
import { Toc, type TocItem } from "./toc";

// Center column + right rail of a docs route: page header (title/description
// from nav.ts), mobile tab row, the MDX content, and the floating "On this
// page" outline. The (docs) layout supplies the flex container and sidebar;
// this renders as its direct flex children so the rail sits at the far edge.
export function DocsPage({
  path,
  toc,
  children,
}: {
  path: string;
  toc?: TocItem[];
  children: React.ReactNode;
}) {
  const route = NAV.find((item) => item.path === path);
  if (!route) throw new Error(`DocsPage: unknown route "${path}"`);
  return (
    <>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-190 px-6 pt-6 pb-24">
          <header className="flex items-center justify-between gap-4 pb-4">
            <Typography as={Link} variant="title-large" href="/" className="md:hidden">
              MD3 React
            </Typography>
            <span className="hidden md:block" aria-hidden />
            <ThemeToggle />
          </header>
          <MobileTabs />
          <Typography as="h1" variant="display-small" className="font-bold" id="top">
            {route.title}
          </Typography>
          <Typography variant="title-medium" className="mt-2 mb-8 text-on-surface-variant">
            {route.description}
          </Typography>
          {children}
        </div>
      </div>

      {toc && toc.length > 0 && (
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto py-22 pe-6 xl:block">
          <Toc items={toc} />
        </aside>
      )}
    </>
  );
}

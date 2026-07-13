import type * as React from "react";
import Link from "next/link";
import { Typography } from "@brijbyte/md3-react/typography";
import { SidebarNav } from "../../components/SidebarNav";

// Docs chrome: sticky sidebar (desktop) beside the page. Each page renders
// its own center column + TOC rail via <DocsPage> so the rail can be
// per-page while header/sidebar stay shared.
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col p-3 md:flex">
        <Typography as={Link} variant="title-large" href="/" className="shrink-0 px-4 pt-4 pb-2">
          MD3 React
        </Typography>
        <SidebarNav />
      </aside>
      {children}
    </div>
  );
}

import type * as React from "react";
import Link from "next/link";
import { Typography } from "@/ui/typography";
import { DocsPage } from "@/components/DocsPage";
import { SearchButton, SearchDialog } from "@/components/SearchDialog";
import { SidebarNav } from "@/components/SidebarNav";

// Docs chrome: sticky sidebar (desktop) beside the page, with <DocsPage>
// providing every route's center column (title/description via pathname)
// and TOC rail — pages are just their MDX content.
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col p-3 md:flex">
        <Typography as={Link} variant="title-large" href="/" className="shrink-0 px-4 pt-4 pb-2">
          MD3 React
        </Typography>
        <SearchButton />
        <SidebarNav />
      </aside>
      <DocsPage>{children}</DocsPage>
      <SearchDialog />
    </div>
  );
}

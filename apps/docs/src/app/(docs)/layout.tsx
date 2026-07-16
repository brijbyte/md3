import type * as React from "react";
import Link from "next/link";
import { Typography } from "@/ui/typography";
import { DocsPage } from "@/components/DocsPage";
import { SearchDialog, SearchButton } from "@/components/SearchDialog";
import { SidebarNav } from "@/components/SidebarNav";
import { Logo } from "@/components/Logo";

// Docs chrome: sticky sidebar (desktop) beside the page, with <DocsPage>
// providing every route's center column (title/description via pathname)
// and TOC rail — pages are just their MDX content.
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-360">
      <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col p-3 md:flex">
        <div className="flex gap-2 justify-between items-center px-2 py-3">
          <Typography
            as={Link}
            variant="title-large"
            href="/"
            className="flex items-center gap-2 shrink-0 grow"
          >
            <Logo size={28} />
            <span>MD3 React</span>
          </Typography>
          <SearchButton />
        </div>
        <SidebarNav />
      </aside>
      <DocsPage>{children}</DocsPage>
      <SearchDialog />
    </div>
  );
}

import type * as React from "react";
import Link from "next/link";
import { Typography } from "@/ui/typography";
import { SearchDialog, SearchIconButton } from "@/components/SearchDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

// Full-width landing chrome: no sidebar, just a slim header and the page.
// Only the home page lives here; showcases have their own (showcase) group.
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-6 pb-24">
      <header className="flex items-center justify-between gap-4 pb-12">
        <Typography as={Link} variant="title-large" href="/">
          MD3 React
        </Typography>
        <div className="flex items-center gap-2">
          <SearchIconButton />
          <ThemeToggle />
        </div>
      </header>
      {children}
      <SearchDialog />
    </div>
  );
}

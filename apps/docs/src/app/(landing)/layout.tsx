import type * as React from "react";
import Link from "next/link";
import { Typography } from "@/ui/typography";
import { ThemeToggle } from "@/components/ThemeToggle";

// Full-width landing chrome: no sidebar, just a slim header and the page.
// The home page and the showcases (full-app demos, not doc pages) live here.
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-6 pb-24">
      <header className="flex items-center justify-between gap-4 pb-12">
        <Typography as={Link} variant="title-large" href="/">
          MD3 React
        </Typography>
        <ThemeToggle />
      </header>
      {children}
    </div>
  );
}

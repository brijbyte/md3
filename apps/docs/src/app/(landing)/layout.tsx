import type * as React from "react";
import Link from "next/link";
import { Typography } from "@/ui/typography";
import { SearchDialog, SearchButton } from "@/components/SearchDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

const FOOTER_LINKS = [
  { label: "GitHub", href: "https://github.com/brijbyte/md3" },
  { label: "npm: md3-react", href: "https://www.npmjs.com/package/@brijbyte/md3-react" },
  { label: "npm: md3-icons", href: "https://www.npmjs.com/package/@brijbyte/md3-icons" },
  { label: "Base UI", href: "https://base-ui.com" },
  { label: "Material Design 3", href: "https://m3.material.io" },
];

// Full-width landing chrome: no sidebar, just a slim header and the page.
// Holds the home page and /icons; showcases have their own (showcase) group.
export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-6 pb-12">
      <header className="flex items-center justify-between gap-4 pb-12">
        <Typography as={Link} variant="title-large" href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span>MD3 React</span>
        </Typography>
        <div className="flex items-center gap-2">
          <SearchButton />
          <ThemeToggle />
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="mt-24 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-outline-variant pt-8">
        <Typography as="span" variant="body-medium" className="text-on-surface-variant">
          MD3 React — Material Design 3 for React, built on Base UI.
        </Typography>
        <nav aria-label="External links" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Typography
              key={link.href}
              as="a"
              variant="label-large"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-on-surface hover:underline"
            >
              {link.label}
            </Typography>
          ))}
        </nav>
      </footer>
      <SearchDialog />
    </div>
  );
}

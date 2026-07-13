"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Typography } from "@brijbyte/md3-react/typography";
import { SECTIONS, type NavItem } from "../nav";
import "./SidebarNav.css";

// Desktop sidebar sections (MD3 nav-drawer styling). Client component only for
// usePathname — during prerender it resolves per-route, so the static HTML
// carries the correct active state too.
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="docs-nav-scroll flex flex-col overflow-y-auto" aria-label="Documentation">
      {SECTIONS.map((section) => (
        <React.Fragment key={section.label}>
          {/* MD3 nav-drawer section header. */}
          <Typography
            as="span"
            variant="title-small"
            className="px-4 pt-5 pb-2 font-brand text-on-surface-variant"
          >
            {section.label}
          </Typography>
          <div className="flex flex-col gap-1">
            {section.items.map((item) => (
              <NavLink key={item.path} item={item} active={item.path === pathname} />
            ))}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Typography
      as={Link}
      variant="label-large"
      href={item.path}
      aria-current={active ? "page" : undefined}
      className={`flex h-14 items-center gap-3 rounded-full px-4 font-brand ${
        active
          ? "bg-secondary-container text-on-secondary-container"
          : "text-on-surface-variant hover:bg-on-surface/8"
      }`}
    >
      <item.icon className="text-2xl" />
      {item.label}
    </Typography>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "../nav";
import "./MobileTabs.css";

// Mobile nav: a flat, horizontally scrollable tab row (styled after MD3
// primary tabs in MobileTabs.css). The active tab is nudged into view on mount —
// scrollIntoView only affects this row's own scroll container, and
// block: "nearest" keeps the page's vertical scroll untouched.
const TABS = NAV.filter((item) => item.path !== "/");

export function MobileTabs() {
  const pathname = usePathname();
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    ref.current
      ?.querySelector("[data-active]")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
    // Mount only: later route changes keep the user's scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav
      ref={ref}
      className="docs-mobile-tabs -mx-6 mb-6 flex overflow-x-auto px-6 md:hidden"
      aria-label="Documentation"
    >
      {TABS.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          aria-current={item.path === pathname ? "page" : undefined}
          data-active={item.path === pathname ? "" : undefined}
          className="docs-mobile-tab font-brand"
        >
          <item.icon className="docs-mobile-tab-icon" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

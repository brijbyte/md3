"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tab, TabList, Tabs } from "@/ui/tabs";
import { NAV } from "../nav";

// Mobile nav: the library's primary Tabs used as page navigation — each tab
// renders a Link and the pathname is the controlled value (never changed by
// the Tabs themselves; a click navigates away). The active tab is nudged into
// view on mount — scrollIntoView only affects the TabList's own scroll
// container, and block: "nearest" keeps the page's vertical scroll untouched.
const TABS = NAV.filter((item) => item.path !== "/");

export function MobileTabs() {
  const pathname = usePathname();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    ref.current
      ?.querySelector("[data-active]")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <Tabs
      value={pathname}
      className="-mx-6 mb-6 md:hidden"
      render={<nav aria-label="Documentation" />}
    >
      <TabList ref={ref} className="px-6">
        {TABS.map((item) => (
          <Tab
            key={item.path}
            value={item.path}
            icon={<item.icon />}
            nativeButton={false}
            render={
              <Link href={item.path} aria-current={item.path === pathname ? "page" : undefined} />
            }
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
}

"use client";

import "./NavigationProgress.css";

import * as React from "react";
import { usePathname } from "next/navigation";
import { LinearProgress } from "@/ui/linear-progress";

// Soft-navigation feedback, ported from the old entry.browser.tsx: while the
// next route is in flight, render the library's indeterminate LinearProgress
// pinned to the viewport (NavigationProgress.css) — <html data-navigating>
// stays for the progress cursor (styled in the root layout).
// The app router has no global pending event, so navigation is detected on
// same-origin link clicks that will navigate, and cleared when the pathname
// (or, on failure, nothing) changes.
// Only navigations still in flight after this long show feedback — prefetched
// routes resolve near-instantly and shouldn't flash the bar.
const SHOW_DELAY_MS = 200;

export function NavigationProgress() {
  const pathname = usePathname();
  const [navigating, setNavigating] = React.useState(false);
  const timer = React.useRef<number>(undefined);

  React.useEffect(() => {
    clearTimeout(timer.current);
    document.documentElement.removeAttribute("data-navigating");
    setNavigating(false);
  }, [pathname]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a");
      if (
        !link ||
        !link.href ||
        (link.target && link.target !== "_self") ||
        link.origin !== location.origin ||
        link.hasAttribute("download") ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.shiftKey ||
        e.defaultPrevented
      ) {
        return;
      }
      // Same-document moves (hash jumps, reselecting the current page) render
      // instantly — no bar. Everything else is a soft navigation.
      if (link.pathname === location.pathname && link.search === location.search) return;
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        document.documentElement.setAttribute("data-navigating", "");
        setNavigating(true);
      }, SHOW_DELAY_MS);
    };
    // Capture phase: runs even though Link stops/prevents the bubbled default.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(timer.current);
    };
  }, []);

  return navigating ? (
    <LinearProgress className="docs-nav-progress" aria-label="Loading page" />
  ) : null;
}

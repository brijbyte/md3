"use client";

import "./NavigationProgress.css";

import * as React from "react";
import { usePathname } from "next/navigation";

// Soft-navigation feedback, ported from the old entry.browser.tsx: while the
// next route is in flight, <html data-navigating> shows the MD3 indeterminate
// linear progress bar pinned to the viewport (NavigationProgress.css) and a
// progress cursor.
// The app router has no global pending event, so the attribute is set on
// same-origin link clicks that will navigate, and cleared when the pathname
// (or, on failure, nothing) changes.
export function NavigationProgress() {
  const pathname = usePathname();

  React.useEffect(() => {
    document.documentElement.removeAttribute("data-navigating");
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
      document.documentElement.setAttribute("data-navigating", "");
    };
    // Capture phase: runs even though Link stops/prevents the bubbled default.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

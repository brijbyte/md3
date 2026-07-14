import type * as React from "react";
import { ShowcaseFabMenu } from "@/components/ShowcaseFabMenu";

// Standalone chrome for the full-app showcases: no docs header or container —
// the demo owns the viewport; docs controls dock as a corner FAB menu.
export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ShowcaseFabMenu />
    </>
  );
}

import "./row.css";

import type * as React from "react";

// Local layout helper — styles on MD3 tokens only (row.css), so the demo
// package stays standalone (no host CSS, no docs utilities).
export function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="demo-row">
      {label && <span className="demo-row-label">{label}</span>}
      {children}
    </div>
  );
}

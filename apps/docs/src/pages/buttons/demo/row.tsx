import "./row.css";

import type * as React from "react";

export function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="demo-row">
      {label && <span className="demo-row-label">{label}</span>}
      {children}
    </div>
  );
}

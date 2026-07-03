import type * as React from "react";

// Local layout helper — inline styles on MD3 tokens only, so the demo package
// stays standalone (no host CSS, no docs utilities).
export function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, paddingBlock: 12 }}
    >
      {label && (
        <span
          style={{
            width: 90,
            flexShrink: 0,
            textTransform: "capitalize",
            fontFamily: "var(--md-sys-typescale-label-large-font)",
            fontSize: "var(--md-sys-typescale-label-large-size)",
            lineHeight: "var(--md-sys-typescale-label-large-line-height)",
            fontWeight: 500,
            letterSpacing: "var(--md-sys-typescale-label-large-tracking)",
            color: "var(--md-sys-color-on-surface-variant)",
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

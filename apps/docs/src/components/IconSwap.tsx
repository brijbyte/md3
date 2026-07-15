import * as React from "react";
import "./IconSwap.css";

// MD3 rotate-through swap between two icons: both share one grid cell (no layout
// shift) and the outgoing icon rotates + scales away while the incoming one
// rotates + scales in, using the emphasized easing set. `swapped` picks the
// second icon; when the active icon is instead driven by an ancestor selector
// (e.g. the theme toggle's [data-theme]), omit it and target the classes in CSS.
export function IconSwap({
  swapped,
  className,
  children,
}: {
  swapped?: boolean;
  className?: string;
  children: [React.ReactNode, React.ReactNode];
}) {
  return (
    <span
      className={className ? `icon-swap ${className}` : "icon-swap"}
      data-swapped={swapped || undefined}
      aria-hidden
    >
      <span className="icon-swap-item icon-swap-1">{children[0]}</span>
      <span className="icon-swap-item icon-swap-2">{children[1]}</span>
    </span>
  );
}

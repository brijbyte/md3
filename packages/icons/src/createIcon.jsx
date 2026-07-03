import * as React from "react";

// All Material Symbols SVGs share this viewBox (24dp grid, y-flipped font coords).
const VIEWBOX = "0 -960 960 960";

/**
 * Wraps a Material Symbols path in a sized, colorable, ref-forwarding <svg>.
 * @param {string} displayName @param {string} d
 */
export function createIcon(displayName, d) {
  const Icon = React.forwardRef(function render(props, ref) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={VIEWBOX}
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden
        ref={ref}
        {...props}
      >
        <path d={d} />
      </svg>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}

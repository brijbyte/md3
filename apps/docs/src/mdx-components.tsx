import type * as React from "react";
import { MDX_COMPONENTS } from "./components/mdx-components";

// Component provider for compiled MDX (satteri-nextjs convention): every page
// gets the MD3-styled markdown element map without importing it itself.
// next.config.ts aliases the provider specifier here for both bundlers.
export function useMDXComponents(
  components?: Record<string, React.ElementType>,
): Record<string, React.ElementType> {
  return { ...MDX_COMPONENTS, ...components };
}

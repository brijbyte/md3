// Shape of vite-plugin-satteri's compiled .mdx modules (toc is appended by
// vite.config's mdxPlugin).
declare module "*.mdx" {
  import type * as React from "react";
  const MDXContent: React.ComponentType<{ components?: Record<string, React.ElementType> }>;
  export const frontmatter: Record<string, unknown>;
  export const toc: { depth: number; text: string; id: string }[];
  export default MDXContent;
}

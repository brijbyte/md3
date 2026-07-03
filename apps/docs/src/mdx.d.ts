// Shape of vite-plugin-satteri's compiled .mdx modules.
declare module "*.mdx" {
  import type * as React from "react";
  const MDXContent: React.ComponentType<{ components?: Record<string, React.ElementType> }>;
  export const frontmatter: Record<string, unknown>;
  export default MDXContent;
}

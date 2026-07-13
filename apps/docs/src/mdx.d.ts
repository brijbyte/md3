// Ambient types for compiled MDX content modules (satteri-nextjs exports).
declare module "*.mdx" {
  import type * as React from "react";
  const MDXContent: React.ComponentType<{ components?: Record<string, React.ElementType> }>;
  export const frontmatter: Record<string, unknown>;
  export const toc: { depth: number; value: string; id: string }[];
  export default MDXContent;
}

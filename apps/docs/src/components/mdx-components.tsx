import type * as React from "react";

// MD3-styled replacements for markdown elements, passed to every MDX page
// via its `components` prop (see mdxPage in Root.tsx). Server-safe.
type Props<T extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[T];

export const MDX_COMPONENTS: Record<string, React.ElementType> = {
  h2: (props: Props<"h2">) => (
    <h2 className="mt-10 mb-3 font-brand text-headline-small" {...props} />
  ),
  h3: (props: Props<"h3">) => <h3 className="mt-8 mb-2 font-brand text-title-large" {...props} />,
  p: (props: Props<"p">) => <p className="my-4" {...props} />,
  a: (props: Props<"a">) => <a className="text-primary underline" {...props} />,
  ul: (props: Props<"ul">) => <ul className="my-4 list-disc space-y-1 pl-6" {...props} />,
  ol: (props: Props<"ol">) => <ol className="my-4 list-decimal space-y-1 pl-6" {...props} />,
  blockquote: (props: Props<"blockquote">) => (
    <blockquote
      className="my-4 border-l-4 border-primary pl-4 text-on-surface-variant"
      {...props}
    />
  ),
  hr: (props: Props<"hr">) => <hr className="my-8 border-outline-variant" {...props} />,
  // Block code keeps the pre's styling; only inline code gets its own chip look.
  // Shiki (hast plugin in vite.config) adds its own className — merge, don't replace.
  pre: ({ className, ...props }: Props<"pre">) => (
    <pre
      className={`my-4 overflow-x-auto rounded-large bg-surface-container p-4 text-body-medium [&>code]:bg-transparent [&>code]:p-0 ${className ?? ""}`}
      {...props}
    />
  ),
  code: (props: Props<"code">) => (
    <code
      className="rounded-small bg-surface-container px-1.5 py-0.5 text-body-medium"
      {...props}
    />
  ),
  table: (props: Props<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-body-medium" {...props} />
    </div>
  ),
  th: (props: Props<"th">) => (
    <th
      className="border-b border-outline-variant px-3 py-2 text-left text-label-large"
      {...props}
    />
  ),
  td: (props: Props<"td">) => (
    <td className="border-b border-outline-variant px-3 py-2" {...props} />
  ),
};

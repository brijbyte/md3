import type * as React from "react";
import { Typography, type TypographyVariant } from "@brijbyte/md3-react/typography";
import CampaignIcon from "@brijbyte/md3-icons/outlined/Campaign";
import InfoIcon from "@brijbyte/md3-icons/outlined/Info";
import LightbulbIcon from "@brijbyte/md3-icons/outlined/Lightbulb";
import ReportIcon from "@brijbyte/md3-icons/outlined/Report";
import WarningIcon from "@brijbyte/md3-icons/outlined/Warning";
import { HeadingAnchor } from "./HeadingAnchor";

// MD3-styled replacements for markdown elements, passed to every MDX page
// via the mdx-components provider (src/mdx-components.tsx). Server-safe.
type Props<T extends keyof React.JSX.IntrinsicElements> = React.JSX.IntrinsicElements[T];

// GFM alert blockquotes (`> [!NOTE]`), tagged data-alert by the alerts hast
// plugin in satteri/hast-plugins.mjs. MD3 has no yellow, so warning/caution both lean on error.
const ALERTS: Record<
  string,
  { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; accent: string }
> = {
  note: { icon: InfoIcon, label: "Note", accent: "border-primary text-primary" },
  tip: { icon: LightbulbIcon, label: "Tip", accent: "border-tertiary text-tertiary" },
  important: { icon: CampaignIcon, label: "Important", accent: "border-secondary text-secondary" },
  warning: { icon: WarningIcon, label: "Warning", accent: "border-error text-error" },
  caution: { icon: ReportIcon, label: "Caution", accent: "border-error text-error" },
};

function Callout({
  variant,
  children,
}: {
  variant: keyof typeof ALERTS;
  children?: React.ReactNode;
}) {
  const alert = ALERTS[variant];
  return (
    <aside
      className={`my-4 rounded-r-large border-l-4 bg-surface-container-low py-4 pr-4 pl-5 ${alert.accent}`}
    >
      <Typography variant="label-large" className={`flex items-center gap-2 ${alert.accent}`}>
        <alert.icon className="text-xl" /> {alert.label}
      </Typography>
      <div className="text-on-surface *:first:mt-2 *:last:mb-0 [&_p]:my-2">{children}</div>
    </aside>
  );
}

// Heading with a hover-revealed copy-link anchor (ids come from the hast plugin).
function heading(tag: "h2" | "h3", variant: TypographyVariant, className: string) {
  return ({ id, children, ...props }: Props<"h2">) => (
    <Typography as={tag} variant={variant} id={id} className={`group ${className}`} {...props}>
      {children}
      {id && <HeadingAnchor id={id} />}
    </Typography>
  );
}

export const MDX_COMPONENTS: Record<string, React.ElementType> = {
  h2: heading("h2", "headline-small", "mt-10 mb-3 scroll-mt-6"),
  h3: heading("h3", "title-large", "mt-8 mb-2 scroll-mt-6"),
  p: (props: Props<"p">) => <Typography className="my-4" {...props} />,
  a: (props: Props<"a">) => <a className="text-primary underline" {...props} />,
  ul: (props: Props<"ul">) => <ul className="my-4 list-disc space-y-1 ps-6" {...props} />,
  ol: (props: Props<"ol">) => <ol className="my-4 list-decimal space-y-1 ps-6" {...props} />,
  blockquote: ({
    "data-alert": alert,
    children,
    ...props
  }: Props<"blockquote"> & { "data-alert"?: string }) =>
    alert && ALERTS[alert] ? (
      <Callout variant={alert}>{children}</Callout>
    ) : (
      <blockquote
        className="my-4 border-s-4 border-primary ps-4 text-on-surface-variant"
        {...props}
      >
        {children}
      </blockquote>
    ),
  hr: (props: Props<"hr">) => <hr className="my-8 border-outline-variant" {...props} />,
  // Block code keeps the pre's styling; only inline code gets its own chip look.
  // Shiki (hast plugin in satteri/hast-plugins.mjs) adds its own className — merge, don't replace.
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
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  th: (props: Props<"th">) => (
    <Typography
      as="th"
      variant="label-large"
      className="border-b border-outline-variant px-3 py-2 text-start"
      {...props}
    />
  ),
  td: (props: Props<"td">) => (
    <Typography
      as="td"
      variant="body-medium"
      className="border-b border-outline-variant px-3 py-2"
      {...props}
    />
  ),
};

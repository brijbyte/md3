import "@brijbyte/md3-react/typography.css";
import "./token-utilities.css";

import { Typography } from "@brijbyte/md3-react/typography";

// Every class here comes from tailwind-tokens.css: color (bg-*/text-*),
// typescale (text-title-large), shape (rounded-*), elevation (shadow-level*).
// They resolve to var(--md-sys-*), so the card follows the theme toggle.
export default function TokenUtilitiesDemo() {
  return (
    <article className="demo-token-utilities rounded-large bg-surface-container-high p-6 shadow-level1">
      <Typography variant="title-large" className="text-on-surface">
        Tokens as utilities
      </Typography>
      <Typography
        variant="body-medium"
        className="demo-token-utilities-body text-on-surface-variant"
      >
        MD3 system tokens mapped to Tailwind theme namespaces — toggle the docs theme and every
        class below follows.
      </Typography>
      <div className="demo-token-utilities-chips">
        <Typography
          as="span"
          className="rounded-small bg-primary px-3 py-2 text-label-large text-on-primary"
        >
          bg-primary
        </Typography>
        <Typography
          as="span"
          className="rounded-small bg-secondary-container px-3 py-2 text-label-large text-on-secondary-container"
        >
          bg-secondary-container
        </Typography>
        <Typography
          as="span"
          className="rounded-small bg-tertiary-container px-3 py-2 text-label-large text-on-tertiary-container"
        >
          bg-tertiary-container
        </Typography>
        <Typography
          as="span"
          className="rounded-small bg-error-container px-3 py-2 text-label-large text-on-error-container"
        >
          bg-error-container
        </Typography>
        <Typography
          as="span"
          className="rounded-small border border-outline px-3 py-2 text-label-large text-on-surface"
        >
          border-outline
        </Typography>
      </div>
    </article>
  );
}

import "./token-utilities.css";

// Every class here comes from tailwind-tokens.css: color (bg-*/text-*),
// typescale (text-title-large), shape (rounded-*), elevation (shadow-level*).
// They resolve to var(--md-sys-*), so the card follows the theme toggle.
export default function TokenUtilitiesDemo() {
  return (
    <article className="demo-token-utilities rounded-large bg-surface-container-high p-6 shadow-level1">
      <h3 className="text-title-large text-on-surface">Tokens as utilities</h3>
      <p className="demo-token-utilities-body text-body-medium text-on-surface-variant">
        MD3 system tokens mapped to Tailwind theme namespaces — toggle the docs theme and every
        class below follows.
      </p>
      <div className="demo-token-utilities-chips">
        <span className="rounded-small bg-primary px-3 py-2 text-label-large text-on-primary">
          bg-primary
        </span>
        <span className="rounded-small bg-secondary-container px-3 py-2 text-label-large text-on-secondary-container">
          bg-secondary-container
        </span>
        <span className="rounded-small bg-tertiary-container px-3 py-2 text-label-large text-on-tertiary-container">
          bg-tertiary-container
        </span>
        <span className="rounded-small bg-error-container px-3 py-2 text-label-large text-on-error-container">
          bg-error-container
        </span>
        <span className="rounded-small border border-outline px-3 py-2 text-label-large text-on-surface">
          border-outline
        </span>
      </div>
    </article>
  );
}

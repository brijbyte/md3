# @brijbyte/md3-react

[Material Design 3](https://m3.material.io/) components for React, built on
[Base UI](https://base-ui.com). Ships plain, precompiled CSS — no build-tool
integration, CSS-in-JS runtime, or bundler plugin required. RSC-compatible:
import them directly in Server Component.

## Install

```bash
pnpm add @brijbyte/md3-react
```

## Styles

JavaScript and CSS are decoupled — importing a component does **not** pull in
its styles. Import the shared layers plus only the components you use, so the
CSS payload stays minimal:

```tsx
import "@brijbyte/md3-react/tokens.css"; // required: design tokens + theming
import "@brijbyte/md3-react/ripple.css"; // required by pressable components
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css"; // builds on button.css
```

> [!IMPORTANT]
> Import order matters: `tokens.css` first, and `button.css` before
> `icon-button.css` / `fab.css` / `split-button.css` — the button family shares
> Button's CSS as its base, and those files both require and override parts of
> it. The aggregate bundle below orders everything itself.

> [!NOTE]
> An everything bundle exists — `@brijbyte/md3-react/styles.css` — but it ships
> every component's CSS whether you use it or not; prefer per-component imports.

## Tailwind CSS

All library CSS lives in Tailwind v4's own cascade layers — tokens in `theme`,
component styles in `components` — so Tailwind integrates cleanly. Pin the
standard Tailwind layer order once, before any stylesheet loads (its own file,
not processed by Tailwind):

```css
/* layers.css — must be the first stylesheet the app loads */
@layer theme, base, components, utilities;
```

This keeps the components between Tailwind's `base` (preflight can't break
them) and `utilities` (utility classes override component styles without
`!important`):

```tsx
<Button className="rounded-lg bg-fuchsia-600">Tailwind-styled</Button>
```

To use the MD3 tokens as Tailwind utilities in your own markup, import the
generated theme inside your Tailwind entry CSS (values are `var()` references,
so they track light/dark at runtime):

```css
@import "tailwindcss";
@import "@brijbyte/md3-react/tailwind-tokens.css";
```

```tsx
<div className="bg-surface-container-low rounded-extra-large shadow-level1">
  <h2 className="font-brand text-title-large text-on-surface">Title</h2>
</div>
```

Covers all system tokens: colors (`bg-primary`, `text-on-surface-variant`, …),
typescale (`text-body-large` with line-height/weight/tracking), shape
(`rounded-extra-large`), elevation (`shadow-level1`…`level5`), easing
(`ease-emphasized`), and fonts (`font-brand`, `font-plain`).

## Usage

```tsx
// No barrel export — import each component from its own path (better
// tree-shaking and code-splitting by default):
import { Button } from "@brijbyte/md3-react/button";
import { Checkbox } from "@brijbyte/md3-react/checkbox";

<Button variant="tonal" icon={<PlusIcon />}>
  Add
</Button>;
```

Dark mode: set `data-theme="dark"` on `<html>` (falls back to
`prefers-color-scheme` when unset; force light with `data-theme="light"`).

Customization: override CSS custom properties (`--md-sys-color-primary`, …) or
target the stable class names (`.md3-button-root`) and data attributes
(`[data-variant]`, `[data-checked]`). All library CSS lives in the `theme` /
`components` layers, so unlayered app CSS wins without specificity hacks.

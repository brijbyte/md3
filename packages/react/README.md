# @brijbyte/md3-react

[Material Design 3](https://m3.material.io/) components for React, built on
[Base UI](https://base-ui.com). Ships plain, precompiled CSS — no build-tool
integration, CSS-in-JS runtime, or bundler plugin required. RSC-compatible:
components are marked `'use client'`; import them directly in Server Component
trees.

## Install

```bash
pnpm add @brijbyte/md3-react
```

## Styles

JavaScript and CSS are decoupled — importing a component does **not** pull in
its styles. Import the stylesheet once at your app root:

```tsx
import "@brijbyte/md3-react/styles.css";
```

Or, for a minimal payload, import the shared layers plus only the components
you use:

```tsx
import "@brijbyte/md3-react/tokens.css"; // required: design tokens + theming
import "@brijbyte/md3-react/ripple.css"; // required by pressable components
import "@brijbyte/md3-react/button.css";
```

## Tailwind CSS

All library CSS lives in the `md3.tokens` / `md3.components` cascade layers, so
Tailwind v4 integrates cleanly — pin the layer order once, before any stylesheet
loads (its own file, not processed by Tailwind):

```css
/* layers.css — must be the first stylesheet the app loads */
@layer theme, base, md3.tokens, md3.components, components, utilities;
```

This slots the components between Tailwind's `base` (preflight can't break
them) and `utilities` (utility classes override component styles without
`!important`):

```tsx
<Button className="rounded-lg bg-fuchsia-600">Tailwind-styled</Button>
```

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
(`[data-variant]`, `[data-checked]`). All library CSS lives in `@layer md3`,
so unlayered app CSS wins without specificity hacks.

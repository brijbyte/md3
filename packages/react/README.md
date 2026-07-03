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

## Usage

```tsx
import { Button, Checkbox, Fab, IconButton, Radio, RadioGroup, Switch } from "@brijbyte/md3-react";

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

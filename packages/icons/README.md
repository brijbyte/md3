# @brijbyte/md3-icons

[Material Symbols](https://fonts.google.com/icons) (weight 400) as per-icon React
components, generated from Google Fonts via
[`@material-symbols/svg-400`](https://github.com/marella/material-symbols).

## Install

```bash
pnpm add @brijbyte/md3-icons
```

## Usage

No barrel export — import each icon from its own path:
`@brijbyte/md3-icons/<style>/<icon>` where `<style>` is `outlined`, `rounded`,
or `sharp`, and `<icon>` is the kebab-case symbol name (append `-fill` for the
filled variant).

```tsx
import Add from "@brijbyte/md3-icons/outlined/add";
import FavoriteFill from "@brijbyte/md3-icons/rounded/favorite-fill";

<Add />; // 1em square, fill="currentColor" — sizes/colors with the text around it
<FavoriteFill style={{ fontSize: 32, color: "red" }} />;
```

Each component renders a plain `<svg>` (viewBox `0 -960 960 960`), forwards
refs, spreads all SVG props, and defaults to `aria-hidden` — pass `aria-label`
(and `aria-hidden={false}`) for semantic icons. RSC-safe: no client-only code.

Icon names starting with a digit are prefixed in the identifier only:
`@brijbyte/md3-icons/outlined/360` exports `Icon360`.

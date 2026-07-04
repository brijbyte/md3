# @brijbyte/md3-icons

[Material Symbols](https://fonts.google.com/icons) (weight 400) as per-icon React
components, generated from the SVGs Google Fonts itself serves
(`fonts.gstatic.com/s/i/short-term/release/…/24px.svg`), with the icon list from
[google/material-design-icons](https://github.com/google/material-design-icons).
Downloads are cached in `.cache/` (gitignored); delete it to force a full re-fetch.

## Install

```bash
pnpm add @brijbyte/md3-icons
```

## Usage

No barrel export — import each icon from its own path:
`@brijbyte/md3-icons/<style>/<Icon>` where `<style>` is `outlined`, `rounded`,
or `sharp`, and `<Icon>` is the PascalCase symbol name (append `Fill` for the
filled variant).

```tsx
import Add from "@brijbyte/md3-icons/outlined/Add";
import FavoriteFill from "@brijbyte/md3-icons/rounded/FavoriteFill";

<Add />; // 1em square, fill="currentColor" — sizes/colors with the text around it
<FavoriteFill style={{ fontSize: 32, color: "red" }} />;
```

Icons are default-export only (all icon modules share one `icon.d.ts` declaration).

Each component renders a plain `<svg>` (viewBox `0 -960 960 960`), forwards
refs, spreads all SVG props, and defaults to `aria-hidden` — pass `aria-label`
(and `aria-hidden={false}`) for semantic icons. RSC-safe: no client-only code.

Icon names starting with a digit get an `Icon` prefix:
`@brijbyte/md3-icons/outlined/Icon360`.

## License

The package code is [MIT](./LICENSE). The Material Symbols icon artwork is
copyright Google LLC, licensed under the
[Apache License 2.0](./LICENSE-APACHE-2.0) (upstream:
[google/material-design-icons](https://github.com/google/material-design-icons/blob/master/LICENSE));
the original SVGs are redistributed here converted into React components.

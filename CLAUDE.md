# md3.brijbyte.com

Skip the teaching/learning-checklist workflow here (no LEARNING.md, no comprehension
quizzes) — overrides the global CLAUDE.md teacher instructions. Just do the work.

React implementation of Google's Material Design 3 (https://m3.material.io/), built as a
styled layer on top of Base UI (`@base-ui/react`, the headless library). Deliverable is
both a publishable npm library and a docs site (deployed to md3.brijbyte.com).

## Repo layout

- `packages/react` — the component library, published as `@brijbyte/md3-react` (placeholder name).
  No barrel export: consumers import per path (`@brijbyte/md3-react/button`, `/tokens`).
- `packages/icons` — `@brijbyte/md3-icons`: Material Symbols (weight 400) as per-icon React
  components. Fully generated into `dist/` by `scripts/build-icons.mjs`, which downloads
  SVGs directly from Google Fonts
  (`fonts.gstatic.com/s/i/short-term/release/materialsymbols<style>/<name>/<default|fill1>/24px.svg`;
  name list from the
  google/material-design-icons codepoints file — the fonts.google.com metadata API
  serves the Symbols set only to its own web app) into a gitignored `.cache/svg/`
  (only missing files are fetched; delete `.cache` for a full refresh) — per-icon
  `.js` emitted directly (default export only; all icons share a single `dist/icon.d.ts`,
  mapped by the package `exports` `./*` types condition); only the shared
  `src/createIcon.jsx` helper is compiled (vite lib build). Icons render
  `fill="currentColor"`, so they follow
  `--md-sys-color-*` via whatever `color` the surrounding component/page sets.
  Import per path: `@brijbyte/md3-icons/<outlined|rounded|sharp>/<PascalName>[Fill]`
  (digit-leading names get an `Icon` prefix; legacy alias names that collide
  case-insensitively with a canonical name, e.g. `addchart` vs `add_chart`, are skipped).
- `apps/docs` — Vite RSC docs/demo app (future md3.brijbyte.com), built with
  `@vitejs/plugin-rsc`: `src/Root.tsx` is a server component owning the `<html>` document
  and routing (routes/metadata in `src/nav.ts` — nested sections `SECTIONS` (Overview,
  Components) with routes `/<section>/<page>` (`/overview/getting-started`,
  `/components/buttons`), flattened into `NAV` (landing first) for lookup/SSG; every
  docs route is an MDX page at
  `src/pages/<name>/page.mdx` (page dirs are flat — only routes are nested),
  `React.lazy`-loaded inside `Suspense` so only the active
  route's server chunk is imported — `home.tsx` stays TSX, it's the custom landing).
  Two layouts in Root: `/` is a
  standalone landing page (hero + cards, no sidebar); every other route gets the docs
  sidebar (SECTIONS with MD3 section headers on desktop, flat chips on mobile). MDX is
  compiled by
  Sätteri via `vite-plugin-satteri` — wrapped in vite.config's `mdxPlugin()`, which skips
  plugin-rsc's virtual ids ending in `.mdx`; MDX output is a server component, and Root's
  `mdxPage()` injects the MD3-styled markdown element
  map from `components/mdx-components.tsx`. Code blocks are highlighted at compile time by
  Shiki via a Sätteri hast plugin (`shikiHastPlugin` in vite.config — dual themes
  (`SHIKI_THEMES`: github-light-default + github-dark-dimmed; the material themes
  failed WCAG contrast) as `--shiki-light/--shiki-dark` vars, switched by `[data-theme]`
  CSS in app.css; `data-language` on the `<pre>`; zero client JS). Token styles are
  classes, not inline vars: `transformerStyleToClass` (content-hashed `sk-*` names,
  build-stable) with the generated rules shipped as hoistable
  `<style href="shiki-<hash>" precedence="md3-shiki">` — per code block in MDX
  (inserted as a hast sibling), one shared sheet per demo in `md3:demo-code` (`CSS`/
  `CSS_HREF` exports rendered by `DemoCode`) — deduped by href, delivered through
  SSG, streaming, and soft nav alike.
  **Demos** are standalone drop-in packages: `src/pages/<page>/demo/` holds a
  `package.json` (name, `description` = demo title, real deps, and an `exports` map per
  demo — `{ "style": "./x.css", "default": "./x.tsx" }`, default export = the demo) plus
  the demo files, which import the library only by published specifiers and put layout
  styles as token-based classes in the demo's own css file — never inline `style`
  objects, never docs Tailwind classes; class names are demo-prefixed (`.demo-radio-row`)
  since all demo css on a page is global — so a folder copies out of the repo verbatim.
  The `md3:demos` plugin (vite.config) scans those manifests into the `virtual:md3-demos`
  registry ("<page>/<export>" → title + lazy loader) consumed by the `Demo` server
  component (`components/demo.tsx`, renders a skeleton fallback); pages
  `import { Demo } from "./demo"` — the plugin (enforce: pre, or the real directory wins
  resolution) serves a page-scoped wrapper so `<Demo of="states" />` is relative to the
  page. Each demo tsx imports its sibling css file (the stylesheets a consumer needs);
  in-app that resolves to a virtual JS module importing the equivalent library _source_
  css modules — putting them in the server graph so dev SSR links them in `<head>` at
  first paint (no FOUC), deduping with the components' own css imports in build — plus
  the raw css file itself when it carries demo-own rules (skipped when import-only:
  identical empty outputs across demos would dedupe into one asset and desync
  plugin-rsc's manifest); the raw demo css (also linked by plugin-rsc's css-export
  transform in dev) gets its consumer-only `@import "@brijbyte/md3-react/*.css"` lines
  stripped by the same plugin.
  The demo playground `div.demo-surface` (unlayered rule in app.css) uses `all: initial`
  to sever inherited docs styles while `--md-sys-*` custom properties (exempt from `all`)
  flow through, so demos ignore host CSS but follow the theme toggle. `src/framework/entry.{rsc,ssr,browser}.tsx`
  are the three environment entries; the `md3:ssg` plugin in vite.config.ts prerenders every
  `getStaticPaths()` route (slashless, e.g. `/buttons`) to `<path>.html` (hosts resolve
  the extensionless URL) **plus `<path>.rsc`** (its RSC payload; `/`-ending routes get
  `<dir>/index.{html,rsc}` instead), so **`dist/client/` is the fully static deployable
  site** (`vite preview` serves it with no server handler). Navigation is soft:
  `entry.browser.tsx` intercepts
  same-origin left-clicks + popstate, fetches the target's static `index.rsc`, and swaps
  the payload in a transition (full-reload fallback on fetch failure; modified/external
  clicks untouched). The dev handler serves `…/index.rsc` requests from the same URL shape.
  Interactive code lives under `'use client'`
  (`components/ThemeToggle.tsx`; library components are the client leaves) and hydrates from
  the RSC payload inlined in the HTML. All icons come from `@brijbyte/md3-icons` — never
  hand-write SVGs in docs. Styled entirely with Tailwind v4 (`@tailwindcss/vite`); doubles
  as the Tailwind-integration testbed. Layer order
  (`@layer theme, base, md3.tokens, md3.components, components, utilities;`) is pinned by
  a hoistable `<style href precedence>` rendered in `entry.rsc.tsx`'s `App` wrapper before
  `<Root>` — plugin-rsc emits per-client-reference stylesheets whose head order varies per
  page (React streams precedence groups in first-encounter order), and rendering the pin
  first makes its precedence group sort above every stylesheet link, so it's parsed before
  any `@layer` block regardless of link order (app.css's first line repeats the pin);
  that slots md3 between preflight (can't break components) and utilities (can override
  them). `app.css` also `@import`s `@brijbyte/md3-react/styles.css`. MD3 tokens come from the library's generated `tailwind-tokens.css` (imported in
  `app.css`). The library-source aliases live twice: tsconfig `paths` (for TS importers +
  editor) and mirrored `resolve.alias` regexes in vite.config — tsconfigPaths does not
  apply to imports from `.mdx`/`.css` files, which would otherwise silently bundle a second
  copy of every component from the built package dist.
- pnpm workspace monorepo; root `pnpm build` builds everything, `pnpm dev` runs the docs app.
  Root `package.json` enforces Node >=26 / pnpm >=11.9 (`engineStrict`).

## Architecture decisions (settled — don't relitigate)

- **Headless base**: Base UI 1.x (`@base-ui/react`). Use its primitives (`Button`, `Checkbox`,
  `Radio`, `Switch`, `Toggle`, …) and their `data-*` state attributes (`data-checked`,
  `data-pressed`, `data-disabled`, …) as CSS hooks. Prefer wrapping a Base UI primitive over
  reimplementing behavior.
- **Styling**: CSS Modules, precompiled at library build time so consumers get plain CSS with
  zero build-tool coupling. `generateScopedName: 'md3-[folder]-[local]'` produces stable,
  readable class names (`.md3-button-root`) — these are public API, don't rename casually.
- **Cascade layers**: all library CSS lives in `@layer md3.tokens` / `@layer md3.components`
  so unlayered consumer CSS always wins overrides.
- **Public styling contract**: CSS custom properties (tokens) + `data-*` attributes
  (`data-variant`, Base UI state attrs). Never encode variants into class names.
- **Theming**: static token sets. Light is `:root` default; dark via `[data-theme="dark"]`
  with a `prefers-color-scheme` fallback (`:root:not([data-theme='light'])`). Dynamic
  color (Material You seed generation) is a possible later addition, not current scope.
- **Units**: px everywhere (dp→CSS px is the canonical MD3 web mapping; page zoom scales
  px, and the token pipeline emits px so structural dims and typescale stay in lockstep).
  Never `em` (couples dimensions to each size's font). A possible future a11y upgrade —
  respecting the browser font-size _preference_, which only reaches rem — must be
  system-wide via the token pipeline (typescale sizes/line-heights in rem, à la
  material-web's `0.875rem` defaults) AND replace fixed component heights with
  padding-block-derived heights (MDC Android style — its tokens.xml has no heights) so
  containers grow with the text instead of clipping. Piecemeal rem is worse than all-px.
- **CSS distribution**: per-component files (`dist/styles/<component>.css`, plus
  `tokens.css`, `ripple.css`, and `tailwind-tokens.css`) AND an aggregated `dist/index.css`
  (exported as `@brijbyte/md3-react/styles.css`). Aggregate puts tokens first to establish
  layer order; `tailwind-tokens.css` is never aggregated (raw `@theme` — only meaningful
  inside a consumer's Tailwind v4 build, imported after `@import "tailwindcss"`).
- **JS/CSS decoupled**: no CSS imports in published JS — consumers import stylesheets
  themselves (documented in `packages/react/README.md`). Keep it that way for standard
  npm-package behavior.
- **RSC support**: For a client component,`'use client'` at the start of the file is must.
  New components must include it. The build uses `preserveModules` (dist mirrors src, one
  file per module), and Rolldown preserves the directive per module natively — so re-export
  `index.ts` files, CSS-module maps, tokens, and utils stay directive-free/server-safe.

## Token pipeline

- Single source of truth: `packages/react/tokens/tokens.json` — MD3 system tokens
  (color light+dark, typescale, shape, state-layer opacities, elevation, motion) using
  MD3 baseline values.
- `scripts/build-tokens.mjs` generates `src/generated/tokens.css` (custom props named
  `--md-sys-color-primary` etc., kebab-case per MD3 convention), `src/generated/tokens.ts`
  (typed map, **camelCase keys**, values are `var(...)` strings), and
  `src/generated/tailwind-tokens.css` (Tailwind v4 `@theme inline` mapping all system tokens
  to utility names — `bg-primary`, `text-title-large`, `shadow-level1`, verbatim token keys,
  no prefix; settled naming). `src/generated/` is gitignored.
- Codegen runs inside the Vite build via the `md3:codegen` plugin (tokens + tcm CSS
  typings, regenerates in `--watch` mode too). Standalone CLIs still exist:
  `pnpm build:tokens`, `pnpm typegen:css` — useful before a bare `tsc` on a fresh clone.

## MD3 spec fidelity (important)

Every component must follow the MD3 spec **exactly**. Authoritative sources, in order:

1. `packages/react/tokens/component-specs.json` — component token maps (sizes, colors per
   state, shapes, opacities) extracted from Google's material-web repo
   (`tokens/versions/v0_192/_md-comp-*.scss`). Check here first.
2. For components not yet in that file: `pnpm refresh:specs <component-name>` (root
   script, `scripts/refresh-specs.mjs`) fetches + parses the material-web token scss
   and merges it into component-specs.json; with no args it re-fetches everything.
   List `tokens/versions/v0_192/` via the GitHub API if unsure of a component's name.
3. Spacing tokens not in the token files (padding, gaps): check material-web component
   sass (e.g. `fab/internal/_shared.scss`) or m3.material.io `/components/<name>/specs`.
4. Last resort: screenshot the spec page on m3.material.io with Playwright.

Known hardcoded spacing values already verified: common buttons use the expressive
per-size token sets (`md.comp.button.<size>`; cross-checked across MDC Android
`button/res/values/tokens.xml`, Compose `Button<Size>Tokens.kt`, and m3.material.io
measurements) — height/pad/gap/icon/outline/typescale: xsmall 32/12/8/20/1/label-large,
small (default) 40/16/8/20/1/label-large, medium 56/24/8/24/1/title-medium, large
96/48/12/32/2/headline-small, xlarge 136/64/16/40/3/headline-large; paddings are
symmetric and uniform across all five color variants (the classic v0_192 24px pad /
18px icon / icon-side 16 / text 12-16 exceptions are superseded). One source conflict,
resolved by 2-of-3 majority: xsmall leading/trailing 12 (site and MDC; Compose says 16),
gap 8 (MDC and Compose; site diagram says 4). Extended FAB padding-inline 16px/20px with
12px icon–label gap.

MD3 universals: state layers (hover 8%, focus 10%, pressed 10% of the state color);
disabled = 38% opacity content / 12% containers (checkbox outline/container disabled uses
38%); focus indicator 3px `--md-sys-color-secondary` outline with 2px offset; ripple on
press (see `src/ripple/`); touch targets 48dp via a `.root::after` hit-area pseudo
(`max(48px, 100%)` each axis, so roots must NOT have `overflow: hidden` — ripple clipping
lives on `.stateLayer` instead; Button/IconButton read `--md3-touch-target-width`, which
ButtonGroup sets to 100% on children so targets don't bleed over packed siblings).

## Component conventions

Each component lives in `src/<kebab-name>/` with `<Pascal>.tsx`, `<Pascal>.module.css`,
`index.ts` (re-exports). Add new components to:

1. `vite.config.ts` `build.lib.entry` (per-component entry → per-component CSS)

No barrel export: consumers import per path (`@brijbyte/md3-react/button`); tokens via
`@brijbyte/md3-react/tokens`. Docs tsconfig maps `@brijbyte/md3-react/*` to `src/*/index.ts`.

Patterns:

- Wrap the Base UI primitive, merge `className` via `mergeClassName(styles.x, className)`
  (`src/utils/mergeClassName.ts` — preserves Base UI's callback `className` form), forward refs,
  spread rest props last (except handlers we compose, e.g. `onPointerDown` for ripple). `render`
  and `style` (incl. callback form) pass through to the Base UI root via rest — don't intercept them.
- Variants → `data-variant` attribute styled as `.root[data-variant='filled']`.
- State layer: dedicated `<span className={styles.stateLayer}>` (also the ripple container
  via `useRipple().containerRef`); hover/focus tint via `::before` with `currentColor` or
  explicit per-state colors when spec demands (selection controls flip pressed colors).
- CSS values must reference system tokens (`var(--md-sys-*)`) — literal px only for
  spec-hardcoded dimensions.

## Build / dev workflow

- `pnpm --filter @brijbyte/md3-react build` — vite lib build with `preserveModules`
  (dist mirrors src) and `minify: false` (all package dist output stays readable); codegen
  (tokens, tcm CSS typings) and CSS emission/flattening/aggregation happen via plugins in
  vite.config.ts (`md3:codegen`, `md3:emit-css`; the latter is post-order `generateBundle` —
  Rolldown ignores additions to `bundle`, so it deletes + re-emits to rename CSS assets).
  `pnpm dev` in the package = `vite build --watch`.
- `pnpm dev` (root) — docs dev server. The docs Vite config **aliases the library to
  `packages/react/src`** so library edits HMR instantly without rebuilding
  (`styles.css` → `src/dev-styles.css`, a dev-only stand-in).
- CSS Module typings (`*.module.css.d.ts`, gitignored) are generated by the build/watch;
  a bare `tsc` on a fresh clone needs `pnpm build:tokens && pnpm typegen:css` first.
- Typecheck: `pnpm typecheck` in `packages/react` (checks `tsconfig.json` for src and
  `tsconfig.node.json` for vite.config.ts + scripts/\*.mjs, which have `types: ["node"]`
  and checkJs); `npx tsc --noEmit` in `apps/docs`.
- No tests yet; verify visually in the docs app (all variants × states are demoed there).

## Style rules

- Formatting: `pnpm format` (oxfmt, config in `.oxfmtrc.json`, respects .gitignore);
  lint: `pnpm lint` (oxlint, config in `.oxlintrc.json`). Both run from the workspace
  root; run them before committing.
- Succinct code comments only (max 1–2 lines), and only for non-obvious constraints.
- No `Co-Authored-By` / AI attribution in commits. Never push — user pushes themselves.

## Current status / roadmap

Done: tokens pipeline, ripple, Button (5 variants; 5 expressive sizes via `size` prop →
`data-size`, private `--_*` vars in Button.module.css; `shape` round/square — square
corners 12/12/16/28/28 by size, both morph to pressed corners 8/8/12/16/16 via
`:active` on a `--_radius` var, shape rules use `:where()` so `:active` always wins;
`toggle` prop renders Base UI Toggle — selected keys off `data-pressed`, flips shape
round↔square and colors per variant (filled unselected surface-container/
on-surface-variant → selected primary/on-primary; tonal → secondary/on-secondary;
elevated → primary/on-primary; outlined → inverse-surface/inverse-on-surface with
transparent border, kept when disabled; no text toggle per spec); expressive colors
adopted: outlined label/icon on-surface-variant + outline-variant border incl. disabled
(undimmed), text stays primary (site+MDC majority; Compose's on-surface-variant and its
elevated UnselectedIconColor=OnPrimary are outliers/generation bugs), disabled containers
stay 12% per MDC `material_emphasis_disabled_background` vs Compose's 0.1),
IconButton (standard/filled/tonal/
outlined + toggle), FAB (small/medium/large, colors, lowered, extended), Checkbox
(+ indeterminate), Radio (+ RadioGroup), Switch, ButtonGroup (standard + connected;
corner morph in CSS, press width morph via rAF spring (MDC expressive
fast-spatial: stiffness 800, damping 0.6) — specs from MDC Android
`button_group_tokens.xml`, material-web has none); `@brijbyte/md3-icons` package; Base UI
render/className/style pass-through; Tailwind v4 docs app (integration verified); 48dp
touch targets on all interactive components; docs restructure (standalone landing page,
sidebar docs layout, MDX authoring via Sätteri, Getting started page); standalone demo
packages (`pages/<page>/demo/` + `md3:demos` plugin, isolated `.demo-surface`, all docs
routes as `page.mdx`); layer pin as hoistable head `<style>`; Tabs (primary/secondary,
icons; Base UI `Tabs.Indicator` positioned by its `--active-tab-left/right` vars, elastic
slide in pure CSS — per-edge sine easings flipped by `data-activation-direction`,
matching MDC Android's ElasticTabIndicatorInterpolator but at 250ms medium1 (material-web
duration; Android's 500ms long2 reads too slow); primary label-hug is `calc(±16px)` off
the tab box, exact at intrinsic tab widths but tab-width−32 if a consumer stretches tabs;
`activateOnFocus` defaults true per material-web; `TabPanel` is unstyled a11y wiring —
MD3 specs only the tab bar, panels have no tokens/anatomy); icons build writes to
`dist.tmp` then rename-swaps into `dist` (in-place regen left a seconds-long window where
a running docs dev server couldn't resolve half-written imports); Badge (dot when empty /
large numbered via children, error colors; directive-free so it renders server-side —
plain string className, no Base UI callback form; Tab takes `badge`, anchored to the icon
top-right per material-web labs/badge offsets — dot 6/4, large 2/1 from icon top-center,
selected in CSS via the Badge's public `data-variant` — or inline after a text-only label;
tokens verified identical to MDC Android `Widget.Material3.Badge`, but Android's built-in
maxNumber=999 "999+" clamping is left to consumers, and its edge-based anchor offsets
(badge center 6/12dp inside the top-end corner, ~3dp off material-web's) are not used;
the tab-badge demo lives on the Tabs docs page, not Badge's); demo source tabs — every
`<Demo>` shows its files below the playground in library primary Tabs with a CopyButton
per panel (docs client component, IconButton + clipboard) and collapsed by default
(`CodeCollapse` client component clamps the panels to a faded preview with a centered
elevated "Show code" button; expanded is full height — no inner vertical scroll — with
a text "Hide code" button below that collapses back); the showcase chrome css (tabs,
buttons, ripple) is imported by demo.tsx as source `.module.css` paths (dedicated
`*.module.css` vite alias) so dev SSR links it at first paint — client-chunk-only css
was a FOUC on the tab items; the real dev FOUC culprit was plugin-rsc's
`RemoveDuplicateServerCss` (its hydration effect deletes every server-rendered
client-reference css `<link>` before slow-loading lazy chunks have injected their
css modules → styled → unstyled → styled flash) — `md3:fix-rsc-dev-css-removal`
(vite.config, serve-only) overrides the `virtual:vite-rsc/remove-duplicate-server-css`
module so a link is removed only once a matching `style[data-vite-dev-id]` exists
(head MutationObserver retires the rest; worth upstreaming to plugin-rsc); belt and
braces, entry.browser awaits `framework/dev-css.ts` (every library `.module.css`,
DEV-only, dead-code-eliminated from build) before hydrateRoot, so vite's injected
style copies exist before any link can be retired — add new components to that list;
the remaining "tab items shift" was the Roboto webfont swap (Google Fonts
display=swap vs system-ui widths) — app.css declares a metrics-adjusted `"Roboto
Fallback"` (Arial + fontaine overrides) and overrides `--md-ref-typeface-brand/plain`
to slot it before system-ui, making the swap reflow-free; the demo
itself renders centered in the surface via a
`w-fit mx-auto flex-col gap-4` wrapper (whole block centered, internal left alignment
kept — demo css should size fixed widths as `width: Npx; max-width: 100%`, not
`width: 100%; max-width: Npx`, which collapses under fit-content); sources come from the
`virtual:md3-demo-code:<page>/<export>` module (md3:demos plugin): entry tsx + relative
imports (breadth-first, `collectDemoFiles`) + the manifest `style` css, Shiki-highlighted
at compile time via `codeToHtml` (same `SHIKI_THEMES` pair, rendered with
`dangerouslySetInnerHTML` — zero client JS for the code itself); the registry's `code()`
memoizes its dynamic-import promise (stable identity), Demo kicks it off in render and a
`DemoCodeLoader` child unwraps it with `React.use` inside its own Suspense boundary
(fallback: `DemoCodeSkeleton`, a code-playground-shaped placeholder), so the playground
above never blocks on the code module; the dev watcher invalidates the registry plus a
page's code modules on any demo-file edit — registry too, else its memoized promises
serve stale code — (tsx rides plugin-rsc's server HMR; css/package.json force a full
reload since css HMR won't re-render RSC); tabs indicator prehydration fix — Base UI's `renderBeforeHydration`
script bails permanently when it executes inside one of React streaming's hidden Suspense
segments (offsetWidth 0), so `TabList` renders a companion inline script (isHydrating-gated
like Base UI's) that re-runs it via a MutationObserver once the segment reveals —
reveals are batched past DOMContentLoaded, and the observer microtask fires before the
revealed content's first paint, so the indicator is positioned with zero flicker and no
hydration errors; md3-styled code-block scrollbars (`pre.shiki` in app.css — slim
outline-variant pill via webkit pseudos, standard scrollbar-color scoped to non-WebKit
engines since setting it in Chromium would disable the custom pseudos); icons rebuilt
straight from Google Fonts (gstatic per-icon SVGs into `.cache/`, dropped the
`@material-symbols/svg-400` middleman — 4264 vs 3892 icons), PascalCase module paths
(`outlined/ToggleOn`), default export only with one shared `dist/icon.d.ts` (halves dist
file count; per-icon named exports gone), case-insensitive dedupe of legacy alias names.

Next candidates: expressive sizes for IconButton/FAB (token sets exist:
`m3_comp_icon_button_<size>_*`, `<Size>IconButtonTokens.kt`); error states (checkbox),
Chips, Cards, TextField, Menu/Select, dynamic color theming, rem-based type scaling
(see Units decision), npm publish setup (finalize package name), docs site
content + deploy.

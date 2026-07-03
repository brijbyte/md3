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
  components. Fully generated into `dist/` by `scripts/build-icons.mjs` from
  `@material-symbols/svg-400` (npm mirror of Google Fonts SVGs) — per-icon `.js`/`.d.ts`
  emitted directly; only the shared `src/createIcon.jsx` helper is compiled (vite lib build).
  Import per path: `@brijbyte/md3-icons/<outlined|rounded|sharp>/<kebab-name>[-fill]`.
- `apps/docs` — Vite RSC docs/demo app (future md3.brijbyte.com), built with
  `@vitejs/plugin-rsc`: `src/Root.tsx` is a server component owning the `<html>` document,
  sidebar nav, and routing (no index.html; routes/metadata in `src/nav.ts`, one server-
  component page per component in `src/pages/`, each `React.lazy`-loaded inside `Suspense`
  so only the active route's server chunk is imported); `src/framework/entry.{rsc,ssr,browser}.tsx`
  are the three environment entries; the `md3:ssg` plugin in vite.config.ts prerenders every
  `getStaticPaths()` route (slashless, e.g. `/buttons`) to `<path>.html` (hosts resolve
  the extensionless URL) **plus `<path>.rsc`** (its RSC payload; `/`-ending routes get
  `<dir>/index.{html,rsc}` instead), so **`dist/client/` is the fully static deployable
  site** (`vite preview`
  serves it with no server handler). Navigation is soft: `entry.browser.tsx` intercepts
  same-origin left-clicks + popstate, fetches the target's static `index.rsc`, and swaps
  the payload in a transition (full-reload fallback on fetch failure; modified/external
  clicks untouched). The dev handler serves `…/index.rsc` requests from the same URL shape. Interactive code lives under `'use client'`
  (`components/ThemeToggle.tsx`; library components are the client leaves) and hydrates from
  the RSC payload inlined in the HTML. All icons come from `@brijbyte/md3-icons` — never
  hand-write SVGs in docs. Styled entirely with Tailwind v4 (`@tailwindcss/vite`); doubles
  as the Tailwind-integration testbed. Layer order is pinned by the first line of
  `src/app.css` (`@layer theme, base, md3.tokens, md3.components, components, utilities;`),
  and `app.css` also `@import`s `@brijbyte/md3-react/styles.css` — everything flows
  through that one stylesheet (Root.tsx's only CSS import), so the pin is always the
  first layer declaration parsed; that slots md3 between preflight (can't break
  components) and utilities (can override them). MD3 tokens come from the library's
  generated `tailwind-tokens.css` (imported in `app.css`).
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
- **CSS distribution**: per-component files (`dist/styles/<component>.css`, plus
  `tokens.css`, `ripple.css`, and `tailwind-tokens.css`) AND an aggregated `dist/index.css`
  (exported as `@brijbyte/md3-react/styles.css`). Aggregate puts tokens first to establish
  layer order; `tailwind-tokens.css` is never aggregated (raw `@theme` — only meaningful
  inside a consumer's Tailwind v4 build, imported after `@import "tailwindcss"`).
- **JS/CSS decoupled**: no CSS imports in published JS — consumers import stylesheets
  themselves (documented in `packages/react/README.md`). Keep it that way for standard
  npm-package behavior.
- **RSC support**: every component source file starts with `'use client'`. New components
  must include it. The build uses `preserveModules` (dist mirrors src, one file per module),
  and Rolldown preserves the directive per module natively — so re-export `index.ts` files,
  CSS-module maps, tokens, and utils stay directive-free/server-safe.

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

Known hardcoded spacing values already verified: common buttons leading/trailing space
24px (16px on the icon side when an icon is present; text button 12/16); extended FAB
padding-inline 16px/20px with 12px icon–label gap.

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

Done: tokens pipeline, ripple, Button (5 variants), IconButton (standard/filled/tonal/
outlined + toggle), FAB (small/medium/large, colors, lowered, extended), Checkbox
(+ indeterminate), Radio (+ RadioGroup), Switch, ButtonGroup (standard + connected;
corner morph in CSS, press width morph via rAF spring (MDC expressive
fast-spatial: stiffness 800, damping 0.6) — specs from MDC Android
`button_group_tokens.xml`, material-web has none); `@brijbyte/md3-icons` package; Base UI
render/className/style pass-through; Tailwind v4 docs app (integration verified); 48dp
touch targets on all interactive components.

Next candidates: error states (checkbox), Chips, Cards, TextField,
Menu/Select, dynamic color theming, npm publish setup (finalize package name), docs site
content + deploy.

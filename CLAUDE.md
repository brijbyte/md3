# md3.brijbyte.com

React implementation of Google's Material Design 3 (https://m3.material.io/), built as a
styled layer on top of Base UI (`@base-ui/react`, the headless library). Deliverable is
both a publishable npm library and a docs site (deployed to md3.brijbyte.com).

## Repo layout

- `packages/react` — the component library, published as `@brijbyte/md3-react` (placeholder name).
- `apps/docs` — Vite + React docs/demo app (future md3.brijbyte.com).
- pnpm workspace monorepo; root `pnpm build` builds everything, `pnpm dev` runs the docs app.

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
  `tokens.css` and `ripple.css`) AND an aggregated `dist/index.css` (exported as
  `@brijbyte/md3-react/styles.css`). Aggregate puts tokens first to establish layer order.
- **JS/CSS decoupled**: no CSS imports in published JS — consumers import stylesheets
  themselves (documented in `packages/react/README.md`). Keep it that way for standard
  npm-package behavior.
- **RSC support**: every component source file starts with `'use client'`. The
  `md3:preserve-use-client` plugin in vite.config re-adds the directive to built chunks
  (Rollup strips module-level directives). New components must include it.

## Token pipeline

- Single source of truth: `packages/react/tokens/tokens.json` — MD3 system tokens
  (color light+dark, typescale, shape, state-layer opacities, elevation, motion) using
  MD3 baseline values.
- `scripts/build-tokens.mjs` generates `src/generated/tokens.css` (custom props named
  `--md-sys-color-primary` etc., kebab-case per MD3 convention) and `src/generated/tokens.ts`
  (typed map, **camelCase keys**, values are `var(...)` strings). `src/generated/` is
  gitignored.
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
press (see `src/ripple/`); touch targets 48dp (NOT yet implemented — current interactive
roots are container-sized).

## Component conventions

Each component lives in `src/<kebab-name>/` with `<Pascal>.tsx`, `<Pascal>.module.css`,
`index.ts` (re-exports). Add new components to:

1. `src/index.ts` (runtime export)
2. `vite.config.ts` `build.lib.entry` (per-component entry → per-component CSS)

Patterns:

- Wrap the Base UI primitive, merge `className` via `[styles.x, className].filter(Boolean).join(' ')`,
  forward refs, spread rest props last (except handlers we compose, e.g. `onPointerDown` for ripple).
- Variants → `data-variant` attribute styled as `.root[data-variant='filled']`.
- State layer: dedicated `<span className={styles.stateLayer}>` (also the ripple container
  via `useRipple().containerRef`); hover/focus tint via `::before` with `currentColor` or
  explicit per-state colors when spec demands (selection controls flip pressed colors).
- CSS values must reference system tokens (`var(--md-sys-*)`) — literal px only for
  spec-hardcoded dimensions.

## Build / dev workflow

- `pnpm --filter @brijbyte/md3-react build` — vite lib build; codegen (tokens, tcm CSS
  typings) and CSS emission/aggregation happen via plugins in vite.config.ts
  (`md3:codegen`, `md3:emit-css`). `pnpm dev` in the package = `vite build --watch`.
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
(+ indeterminate), Radio (+ RadioGroup), Switch.

Next candidates: 48dp touch targets, error states (checkbox), Chips, Cards, TextField,
Menu/Select, dynamic color theming, npm publish setup (finalize package name), docs site
content + deploy.

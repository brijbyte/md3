# md3.brijbyte.com

Skip the teaching/learning-checklist workflow here (no LEARNING.md, no comprehension
quizzes) — overrides the global CLAUDE.md teacher instructions. Just do the work.
Note: For screenshot testing with Playwright, always start the server on 5174 port and
don't kill existing server running on port 5173. For any edge case/bug fixes, add an
equivalent test as well.

React implementation of Google's Material Design 3 (https://m3.material.io/), built as a
styled layer on top of Base UI (`@base-ui/react`, the headless library). Deliverable is
both a publishable npm library and a docs site (deployed to md3.brijbyte.com).

## Repo layout

- `packages/react` — the component library, published as `@brijbyte/md3-react` (placeholder
  name). No barrel export: consumers import per path (`@brijbyte/md3-react/button`, `/tokens`).
- `packages/icons` — `@brijbyte/md3-icons`: Material Symbols (weight 400) as per-icon React
  components, fully generated into `dist/` by `scripts/build-icons.mjs` (fetches SVGs from
  Google Fonts gstatic into a gitignored `.cache/svg/` — only missing files fetched, delete
  `.cache` for a full refresh; builds into `dist.tmp` then rename-swaps so a running dev
  server never resolves half-written files). Default export only; all icons share a single
  `dist/icon.d.ts` via the `exports` `./*` types condition. Import per path:
  `@brijbyte/md3-icons/<outlined|rounded|sharp>/<PascalName>[Fill]` (digit-leading names get
  an `Icon` prefix). Icons render `fill="currentColor"`, so they follow `--md-sys-color-*`
  via the surrounding `color`.
- `apps/docs` — Vite RSC docs/demo app (`@vitejs/plugin-rsc`), see below.
- pnpm workspace monorepo; root `pnpm build` builds everything, `pnpm dev` runs the docs app.

## Docs app (`apps/docs`)

- `src/Root.tsx` is a server component owning the `<html>` document and routing;
  routes/metadata live in `src/nav.ts` (`SECTIONS` → routes `/<section>/<page>`, flattened
  into `NAV`). Every docs route is an MDX page at `src/pages/<name>/page.mdx` (page dirs
  flat, only routes nested), `React.lazy`-loaded so only the active route's chunk is
  imported. `/` is a standalone landing page (`home.tsx`); every other route gets the docs
  sidebar layout.
- MDX is compiled by Sätteri (`vite-plugin-satteri`, wrapped in vite.config's `mdxPlugin()`);
  output is a server component and Root's `mdxPage()` injects the MD3-styled element map
  from `components/mdx-components.tsx`. Code blocks are Shiki-highlighted at compile time
  (`shikiHastPlugin`, dual themes as `--shiki-light/--shiki-dark` vars switched by
  `[data-theme]`; zero client JS). On the MDX/hast path the shiki inline style string must
  be left as-is — Sätteri converts it to a JSX style object itself and silently drops
  object values. Headings get slugified anchor ids, and `mdxPlugin` appends
  `export const toc` per page; `DocsLayout` renders the "On this page" right rail from it.
- **Demos are standalone drop-in packages**: `src/pages/<page>/demo/` holds a `package.json`
  (name + real deps) plus one `<demo>.tsx` per demo (default export, sibling `<demo>.css`).
  Demos import the library only by published specifiers and put layout styles as
  token-based, demo-prefixed classes (`.demo-radio-row`) in their own css — never inline
  `style` objects, never docs Tailwind classes — so a folder copies out of the repo
  verbatim. Pages import each demo by its real path and render it directly
  (`<ButtonSizes />`); the `md3:demos` plugin wraps it in the `Demo` server component
  (playground + collapsed code tabs with compile-time-highlighted sources). Pages never
  render `Demo` themselves; section titles/captions are plain markdown above the demo tag.
- Every component docs page opens (after imports, before the first heading) with two fenced
  blocks stating the consumer-facing imports: a `tsx` fence with the component import and a
  `css` fence with the required stylesheets, mirroring the demo css exactly (`tokens.css`,
  `ripple.css` only if the component uses ripple, then `<kebab>.css`). A section
  introducing a second component repeats the pair with just the additional imports.
- Static output: the `md3:ssg` plugin prerenders every `getStaticPaths()` route to
  `<path>.html` **plus `<path>.rsc`**, so `dist/client/` is the fully static deployable
  site. Navigation is soft: `entry.browser.tsx` fetches the target's static `.rsc` payload
  and swaps it in a transition (full-reload fallback; hash-only moves left to the browser).
  `src/framework/entry.{rsc,ssr,browser}.tsx` are the three environment entries.
- Styled with Tailwind v4; doubles as the Tailwind-integration testbed. Layer order
  (`@layer theme, base, components, utilities;`) is pinned by the `md3:layer-order`
  plugin (vite.config), which prepends the statement to every css module — stylesheet
  parse order in `<head>` is nondeterministic (plugin-rsc `preinit`s client-reference css
  during RSC deserialization, ahead of any render-time hoistable), so whichever sheet
  parses first must itself establish the order. `app.css` imports
  `@brijbyte/md3-react/styles.css` and the generated `tailwind-tokens.css`.
- Library-source aliases live twice: tsconfig `paths` AND mirrored `resolve.alias` regexes
  in vite.config — tsconfigPaths does not apply to imports from `.mdx`/`.css` files, which
  would otherwise silently bundle a second copy from the built dist.
- All icons come from `@brijbyte/md3-icons` — never hand-write SVGs in docs.
- Docs fonts (app.css): brand = Roboto (headings, docs title, nav — nav items add the
  `font-brand` utility since their variants default to plain), plain = Roboto Slab
  (body/everything else), code = Roboto Mono via Tailwind `--font-mono` (preflight covers
  all pre/code; demo source tabs add `font-mono`). Docs chrome text renders through the
  library `Typography` component, not `text-*` utilities.
- Dev-only gotchas: `framework/dev-css.ts` imports every library `.module.css` before
  hydration (add new components to that list); `md3:fix-rsc-dev-css-removal` patches
  plugin-rsc's dev css-link removal to avoid a FOUC; app.css declares metrics-adjusted
  local fallbacks for each webfont (Roboto/Slab/Mono) so swaps are reflow-free — computed
  from real font tables (capsize-style weighted advances), don't guess new ones.

## Architecture decisions (settled — don't relitigate)

- **Headless base**: Base UI 1.x (`@base-ui/react`). Use its primitives and their `data-*`
  state attributes (`data-checked`, `data-pressed`, `data-disabled`, …) as CSS hooks.
  Prefer wrapping a Base UI primitive over reimplementing behavior.
- **Styling**: CSS Modules, precompiled at library build time so consumers get plain CSS
  with zero build-tool coupling. `generateScopedName: 'md3-[folder]-[local]'` produces
  stable class names (`.md3-button-root`) — these are public API, don't rename casually.
- **Cascade layers**: all library CSS lives in `@layer theme` (tokens) /
  `@layer components` (component styles) — deliberately Tailwind v4's own layer names —
  so unlayered consumer CSS always wins and Tailwind's standard layer pin needs no extras.
- **Public styling contract**: CSS custom properties (tokens) + `data-*` attributes
  (`data-variant`, Base UI state attrs). Never encode variants into class names.
- **Theming**: static token sets. Light is `:root` default; dark via `[data-theme="dark"]`
  with a `prefers-color-scheme` fallback (`:root:not([data-theme='light'])`). Dynamic
  color (Material You seed generation) is a possible later addition, not current scope.
- **Units**: px everywhere (dp→CSS px is the canonical MD3 web mapping). Never `em`. A
  future rem-based a11y upgrade must be system-wide via the token pipeline AND replace
  fixed component heights with padding-derived heights; piecemeal rem is worse than all-px.
- **CSS distribution**: per-component files (`dist/styles/<component>.css`, plus
  `tokens.css`, `ripple.css`, `tailwind-tokens.css`) AND an aggregated `dist/index.css`
  (exported as `@brijbyte/md3-react/styles.css`, tokens first). `tailwind-tokens.css` is
  never aggregated (raw `@theme` — only meaningful inside a consumer's Tailwind v4 build).
- **JS/CSS decoupled**: no CSS imports in published JS — consumers import stylesheets
  themselves (documented in `packages/react/README.md`).
- **RSC support**: client components must start with `'use client'`. The build uses
  `preserveModules` and Rolldown preserves the directive per module — re-export `index.ts`
  files, CSS-module maps, tokens, and utils stay directive-free/server-safe.
- **Button-family CSS reuse**: `Button.module.css` is the family base — IconButton, FAB,
  and both SplitButton halves stack Button's `.root` (and reuse its stateLayer/icon/label
  spans; `SplitButtonAction` renders `Button` directly); their modules keep only deltas.
  Family overrides keep natural specificity and tie with Button's rules, so ties resolve
  by import order: **button.css must be imported before
  icon-button.css/fab.css/split-button.css** (documented in README + integration page;
  `dist/index.css` sorts alphabetically so the aggregate is always correct; no
  `.root.root` specificity inflation — deliberately rejected). Where import order can't
  decide — family color rules vs Button's disabled colors — the family rules carry
  `:not(:disabled, [data-disabled])` guards so disabled always wins.

## Token pipeline

- Single source of truth: `packages/react/tokens/tokens.json` — MD3 system tokens (color
  light+dark, typescale, shape, state-layer opacities, elevation, motion), baseline values.
- `scripts/build-tokens.mjs` generates `src/generated/tokens.css` (`--md-sys-color-primary`
  etc., kebab-case), `src/generated/tokens.ts` (typed map, **camelCase keys**, `var(...)`
  values), and `src/generated/tailwind-tokens.css` (Tailwind v4 `@theme inline` —
  `bg-primary`, `text-title-large`, `shadow-level1`; verbatim token keys, no prefix;
  settled naming). `src/generated/` is gitignored.
- Codegen runs inside the Vite build via the `md3:codegen` plugin (also in `--watch`).
  Standalone CLIs: `pnpm build:tokens`, `pnpm build:shapes`, `pnpm typegen:css` — needed
  before a bare `tsc` on a fresh clone.

## MD3 spec fidelity (important)

Every component must follow the MD3 spec **exactly**. Authoritative sources, in order:

1. **Android Compose Material3** (`androidx.compose.material3`, `androidx-main` branch of
   `github.com/androidx/androidx`) is the primary reference — it receives spec updates
   first and is the only implementation some redesigns (e.g. progress indicators' gap +
   stop-indicator treatment) have landed in. Fetch the component's `*.kt` source
   (implementation, not just the `tokens/*Tokens.kt` token object) and read the actual
   non-deprecated overload — Compose keeps old behavior around behind
   `@Deprecated(level = HIDDEN)` shims, which must not be mistaken for the current spec.
2. `packages/react/tokens/component-specs.json` — component token maps extracted from
   Google's **material-web** repo (`tokens/versions/v0_192/_md-comp-*.scss`). material-web
   is effectively deprecated (no expressive-era component updates, e.g. it never picked up
   progress indicators' gap/stop-indicator redesign) — treat it as a **backup/cross-check**
   source, useful mainly for spacing/color tokens that haven't changed, not as the primary
   reference for current behavior.
3. For components not yet in that file: `pnpm refresh:specs <component-name>`
   (`scripts/refresh-specs.mjs`) fetches + merges the material-web token scss; no args
   re-fetches everything. List `tokens/versions/v0_192/` via the GitHub API if unsure.
4. Spacing tokens not in the token files (padding, gaps): material-web component sass
   (e.g. `fab/internal/_shared.scss`) or m3.material.io `/components/<name>/specs`.
5. Last resort: screenshot the spec page on m3.material.io with Playwright.

Cross-check expressive values against MDC Android `res/values/tokens.xml` and Compose
`*Tokens.kt`, resolving conflicts by 2-of-3 majority; Compose's token _files_ sometimes
carry values its component code marks `// TODO: incorrect` — trust the component code.
The verified button/IconButton/FAB/SplitButton size sets live in the shipped CSS; the
classic pre-expressive v0_192 button paddings and the small/surface FABs are superseded —
don't reintroduce them.

MD3 universals: state layers (hover 8%, focus 10%, pressed 10% of the state color);
disabled = 38% opacity content / 12% containers; focus indicator 3px
`--md-sys-color-secondary` outline with 2px offset; ripple on press (`src/ripple/`);
touch targets 48dp via a `.root::after` hit-area pseudo (`max(48px, 100%)` each axis, so
roots must NOT have `overflow: hidden` — ripple clipping lives on `.stateLayer`;
Button/IconButton read `--md3-touch-target-width`, which ButtonGroup sets to 100% on
children so targets don't bleed over packed siblings).

## Component conventions

Each component lives in `src/<kebab-name>/` with `<Pascal>.tsx`, `<Pascal>.module.css`,
`index.ts` (re-exports). Add new components to `vite.config.ts` `build.lib.entry`
(per-component entry → per-component CSS) and the docs app's `framework/dev-css.ts`.

Patterns:

- Wrap the Base UI primitive, merge `className` via `mergeClassName(styles.x, className)`
  (`src/utils/mergeClassName.ts` — preserves Base UI's callback `className` form), forward
  refs, spread rest props last (except handlers we compose, e.g. `onPointerDown` for
  ripple). `render` and `style` (incl. callback form) pass through via rest — don't
  intercept them.
- Variants → `data-variant` attribute styled as `.root[data-variant='filled']`.
- State layer: dedicated `<span className={styles.stateLayer}>` (also the ripple container
  via `useRipple().containerRef`); hover/focus tint via `::before` with `currentColor` or
  explicit per-state colors when the spec demands.
- CSS values must reference system tokens (`var(--md-sys-*)`) — literal px only for
  spec-hardcoded dimensions.

## Build / dev workflow

- `pnpm --filter @brijbyte/md3-react build` — vite lib build with `preserveModules` and
  `minify: false` (dist stays readable); codegen and CSS emission/aggregation happen via
  the `md3:codegen` / `md3:emit-css` plugins. `pnpm dev` in the package = `vite build --watch`.
- `pnpm dev` (root) — docs dev server. The docs Vite config **aliases the library to
  `packages/react/src`** so library edits HMR instantly without rebuilding.
- CSS Module typings (`*.module.css.d.ts`, gitignored) are generated by the build/watch;
  a bare `tsc` on a fresh clone needs `pnpm build:tokens && pnpm build:shapes && pnpm typegen:css` first.
- Typecheck: `pnpm typecheck` in `packages/react`; `npx tsc --noEmit` in `apps/docs`.
- No tests yet; verify visually in the docs app (all variants × states are demoed there).

## Style rules

- Formatting: `pnpm format` (oxfmt); lint: `pnpm lint` (oxlint). Both run from the
  workspace root; run them before committing.
- Succinct code comments only (max 1–2 lines), and only for non-obvious constraints.
- No `Co-Authored-By` / AI attribution in commits. Never push — user pushes themselves.

## Current status / roadmap

Next candidates: TextField, Select (MD3 specs it as a menu opened from a text field —
build after TextField; Base UI Select's `alignItemWithTrigger` must be false), dynamic
color theming, rem-based type scaling (see Units decision), npm publish setup (finalize
package name), docs site content + deploy.

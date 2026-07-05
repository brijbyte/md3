# md3.brijbyte.com

Skip the teaching/learning-checklist workflow here (no LEARNING.md, no comprehension
quizzes) — overrides the global CLAUDE.md teacher instructions. Just do the work.

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
- **Segmented buttons deliberately skipped**: deprecated by the expressive update in favor
  of connected ButtonGroup (decided 2026-07).

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

Done: token pipeline, ripple, Button, IconButton, FAB, SplitButton, ButtonGroup , Checkbox,
Radio (+ RadioGroup), Switch, Tabs, Badge, Card, Typography, Chips (AssistChip /
FilterChip / InputChip / SuggestionChip), Menu (Base UI Menu family incl. submenus,
radio/checkbox items, groups), Slider (continuous/discrete/centered/range),
LoadingIndicator (indeterminate only, contained), Snackbar, LinearProgress /
CircularProgress (determinate/indeterminate), `@brijbyte/md3-icons`.

Durable component gotchas: Button's round shape rests at `calc(height/2)`, NOT
`corner-full` (transitioning from 9999px breaks the pressed-corner morph timing); shape
rules use `:where()` so `:active` always wins; the corner morph uses
`--md-sys-motion-easing-fast-spatial` (the 800/0.6 expressive spring exported from
tokens.json as a CSS `linear()` curve, pair with `duration-medium3`); `TabPanel` is
unstyled a11y wiring (MD3 specs only the tab bar); Badge leaves "999+" clamping to
consumers; all four chip types share `chip/Chip.module.css` (InputChip's root is a
non-interactive div — primary action and remove are separate buttons, driven via `:has()`);
trailing icons on FilterChip and a ChipSet wrapper are deliberately out of v1 scope;
Menu deliberately uses the m3.material.io spec-page item metrics (48px rows, 12px inline
padding/gaps, label-large) over material-web's 56px/16px/body-large list-item reuse
(Compose + published spec agree), selection = secondary-container highlight with NO
checkmark, and enter/exit is a CSS scale+fade — material-web's staggered height expand
(JS-driven) was deliberately skipped. Slider's 5 sizes (`size`: xs default/s/m/l/xl) and
their exact dp values (track height, handle height, track corner radius, inset-icon
size) come straight off the m3.material.io/components/sliders/specs measurements table
— not material-web's stale v0*192 scss, which only has the old 4px-track/circular-handle
classic spec. Handle width is 4px at rest at every size, narrowing to 2px (half, per Compose
`SliderTokens.kt`'s `PressedHandleWidth` and MDC's `THUMB_WIDTH_PRESSED_RATIO`) while
`data-pressed`; only height scales with size, driven by
a `--md3-slider-*`custom-property cascade set on`.root[data-size=...]`(inherited down
to track/thumb, no JS needed).`icon`(inset icon) only renders at`m`/`l`/`xl`—`xs`/`s`aren't tall enough per spec. The track fill is up to three independently-shaped`trackSegment` spans (before-tail / active / after-tail), not a single background with a
notch cut into it — a thumb sitting in a gap needs a real rounded corner on \_both* flanking
segments (per m3.material.io's slider spec imagery), which a flat cut can't produce. Each
segment's corners are set inline per-boundary (`segmentStyle`): a boundary against another
segment always rounds, at a smaller fixed-per-size `--md3-slider-gap-radius`(one shape
step down from the track's own radius — e.g.`l`'s gap corner uses `corner-medium`while
its track uses`corner-large`); a boundary at the track's true 0%/100% edge uses the full
`--md3-slider-track-radius`, _unless_ a thumb rests exactly there, in which case that
corner squares off entirely (`trackFlatStart`/`trackFlatEnd`on`.track`) — a rounded
corner must never visibly poke out past the 4px-wide thumb capping it. All of this is
computed once per render from a single `Slider.Value`wrapping`Slider.Track`(not nested
per-feature`Slider.Value`s), since ticks' active/inactive coloring needs the same
active-start/active-end percents. `.track`itself has no fill color — it's`transparent`,
so the small gaps between segments read as a cut-through to whatever's behind the slider,
not a second "inactive" layer; painting a matching-but-distinct surface color there
produces a visible seam in dark mode instead. The value bubble is a Base UI `Tooltip`
(`Root`/`Portal`/`Positioner`/`Popup`, no `Trigger`— anchored via a plain ref instead so
hover never opens it) so it needs no layout space reserved in`.root`; it's open whenever
the thumb is `focused`(keyboard tab, held for the whole focus duration, closing on blur)
OR`pressed`(pointerdown until a window-level pointerup/pointercancel) — two separate
booleans, not one, since`pressed`also drives the visual press state (narrow handle,
state layer via`data-pressed`) and must reflect only an actual pointer drag, never mere
keyboard focus. The anchor passed to `Tooltip.Positioner`is a virtual element re-measured every`requestAnimationFrame`while open, not the thumb
ref directly — the thumb moves via inline`insetInlineStart`, which triggers neither
ResizeObserver nor IntersectionObserver, so Base UI's `autoUpdate`never notices a plain
ref move; a fresh virtual-element object each frame forces Floating UI to recompute. The`.thumb:focus-visible`CSS never matches, since the actually-focusable element is the
visually-hidden native`<input>`Base UI nests inside the thumb div, not the div itself —
use`.thumb:has(:focus-visible)`(same pattern as Tabs/Chip elsewhere in this repo).
Base UI's own`data-dragging`is root-level (true while _any_ thumb in a range slider
drags), so a`data-pressed`attribute mirrors each thumb's own`pressed`state instead for
the per-thumb pressed state layer. Demo containers must set an explicit`width`(e.g.`480px; max-width: 100%`), matching the Tabs demos' convention — the shared `Demo`wrapper
is deliberately`w-fit`, so a percentage width on the demo's own root contributes nothing
to that shrink-to-fit calculation and silently collapses to content size. LoadingIndicator
has no Base UI primitive and no material-web scss (it's Compose-only, added after
material-web's v0*192 snapshot) — its tokens came from `LoadingIndicatorTokens.kt`directly. Its indeterminate animation is a real shape-morph (SoftBurst → Cookie9Sided →
Pentagon → Pill → Sunny → Cookie4Sided → Oval, looping), not a spinning arc, which meant
porting the relevant slice of Google's`androidx.graphics.shapes`(RoundedPolygon
construction + the`Morph`vertex/feature-matching algorithm that pairs differently-sided
polygons) into`packages/react/scripts/loading-indicator/`— a Node-only build-time
module, not shipped to consumers.`pnpm build:shapes`(wired into the`md3:codegen`vite
plugin) runs that port once and bakes the result into gitignored`src/generated/loading-indicator-shapes.ts`: for each shape transition, a list of matched
`[cubicStart, cubicEnd]`pairs already centered/scaled into a shared 0-100 viewBox, so the
component itself only does a per-frame`lerp`between the two cubics plus a live CSS
rotation — no geometry at runtime.`Morph`'s cut-and-shift step has one easy-to-miss edge
case: the redistributed cubic that closes the loop back to the cut point must have its
outline-progress \_forced* to exactly `1`, not derived via `positiveModulo`, or it wraps to
~0 and gets dropped by the zero-length-span filter, leaving a visible gap in the morphed
path (caught by asserting every precomputed morph closes with zero gap at both t=0 and
t=1). The indeterminate step easing samples Compose's actual
`spring(dampingRatio=0.6, stiffness=200)`step-response formula over _real elapsed
milliseconds_ (not a normalized 0-1 progress) — for this damping/stiffness pair the spring
settles well under the fixed 650ms step interval, so this reproduces the same
morph/overshoot/brief-hold cadence as the real Compose component without needing a full
physics simulation loop. Snackbar is built on Base UI's`Toast` primitive
(`@base-ui/react/toast`) rather than a from-scratch implementation — material-web ships
no `labs/snackbar`component to check against, only a`_md-comp-snackbar.scss`token
file, so the spacing constants (16dp text inset, 8dp button-side inset, 14dp vertical
text padding) come from Compose's`Snackbar.kt`instead; the 48px/68px single/two-line
container heights fall out of that 14dp padding plus 1 or 2 lines of body-medium, so`.text`just needs`line-clamp: 2`rather than an explicit height or a two-line/
single-line prop. The desktop-width rule must be`width: fit-content(672px)`, not
`width: max-content`—`max-content`sizes as if nothing ever wraps, so a message under
~672px worth of unwrapped text never triggers the 2-line clamp at all;`fit-content()`still hugs short content but forces`.text`to wrap once the unwrapped width would exceed
the cap.`SnackbarProvider`renders`Toast.Provider`with`limit={1}`(MD3 only ever
shows one snackbar — a new one replaces the current one, they never stack), which is why
the CSS skips Base UI's whole`--toast-index`/peek/scale stacking transform story
entirely — but `limit` only \_marks_ excess toasts `data-limited` rather than removing
them, so during a replacement there are briefly two `.root`s mounted at once (outgoing +
incoming). Every `.root` is therefore `position: absolute`, anchored to the _same_ spot
(bottom-leading-edge) via `inset-block-end`/`inset-inline-start` — not laid out as flex
siblings of `.viewport` — so `[data-limited]` only needs `opacity: 0` to crossfade out in
place; giving the outgoing toast its own different anchor (e.g. the trailing edge)
instead of the same one is exactly what produces a toast that visibly teleports across
the screen before fading, since `position`/`inset` aren't (and shouldn't be)
transitioned, only `opacity`/`transform` are. `useSnackbar()`'s `showSnackbar()` is a thin
MD3-shaped wrapper over `toastManager.add()` (`message`/`action`/`closable`/`duration` →
`description`/`actionProps`/`data.closable`/`timeout`) — deliberately hides the generic
toast API so the library-consumer surface reads as "snackbar", not "toast"; it also takes
a plain string as shorthand for `{ message }`. Per MDC spec, clicking the action button
always dismisses the snackbar (in addition to running the consumer's `onClick`), same as
the close button — Base UI's own docs bake this into the action's `onClick` by hand (see
their "Undo action" example), so `showSnackbar` wraps `action.onClick` in a callback that
also calls `manager.close(id)`, rather than leaving every call site to remember it. Base
UI's Toast already solves the MD3 a11y requirements for free: toasts default to
`priority: 'low'` (`aria-live="polite"`, alert-but-not-disrupt) and pause/resume their
auto-dismiss timer on hover/focus (WCAG timing-adjustable) with no extra wiring. Matching
every other icon-taking component, Snackbar doesn't bundle a close icon —
`SnackbarProvider` takes a `closeIcon` prop (falls back to a plain "×" glyph) rather than
importing `@brijbyte/md3-icons` from inside the library, which no other component does
either. The action button's label comes from Base UI's `toast.actionProps.children`
(opaque text, not JSX children we render ourselves), so unlike the close button's
span-based state layer, the action's hover/focus/pressed tint has to be a `::before`
overlay on the button itself. Any demo that calls `useSnackbar()`/renders
`SnackbarProvider` needs its own top-level `"use client"` — the RSC docs app throws
"client reference export is called on server" if a demo module omits it, even though
`Snackbar.tsx` itself is already marked client. LinearProgress/CircularProgress are built
against Compose's **current** (non-deprecated) `ProgressIndicator.kt` API, not
material-web's older flush-track version (material-web never picked up this redesign —
see the MD3 spec fidelity section on Android vs. material-web priority): a rounded active
indicator, a 4px gap, then a rounded track, ending (linear only) in a small 4px stop dot —
not material-web's classic adjoining track with no gap. Both indicators skip
material-web-only features not present in the current Compose API: no `four-color` mode,
no linear `buffer`. Neither the linear nor circular indicator animates its own determinate
transitions in Compose (the caller is expected to animate the `value` prop itself via
`ProgressAnimationSpec`) — since a web consumer can't easily do that, both add a plain CSS
`transition` on the rendered width/dasharray instead, a deliberate web-side adaptation, not
a spec deviation. Indeterminate linear renders two independently-animated pill bars (no
track, no stop dot, matching Compose exactly) via `inset-inline-start`/`width` keyframes
rather than `transform: translateX()/scaleX()` (material-web's approach) — animating real
layout properties keeps each bar's rounded end a true semicircle at every width, whereas
scaling a border-radius element would visibly squash its caps into an ellipse. Every
keyframe stop sits at an exact kink of Compose's piecewise-linear head/tail motion spec
(computed from its delay/duration constants), so CSS's default linear interpolation
between stops reproduces the curve exactly with no extra sampling needed. Indeterminate
circular combines three independently-eased animations — a linear 1080deg/6s global spin,
a 90deg-per-1.5s stepped rotation (each hop eased via
`--md-sys-motion-easing-emphasized-decelerate`), and a 10%-87% sweep oscillation (eased
growth, linear shrink) — driven through three `@property`-registered custom properties
(`inherits: true`, animated independently so each keeps its own per-segment easing) summed
via a single static `transform: rotate(calc(...))`; this avoids the alternative of trying
to bake all three into one hand-merged keyframe animation, which isn't possible once any
one of them uses a non-linear easing on an actively-moving segment. CSS applies a
keyframe's `animation-timing-function` to the segment leading _out_ of that keyframe —
opposite of Compose's `keyframes { ... using ... }`, which applies to the segment leading
_into_ it — a direction mismatch that's easy to get backwards when porting the timings.
Both also ship a `wavy` variant (Compose's separate `WavyProgressIndicator.kt` /
`*WavyProgressModifiers.kt` — the redesign's wavy indicator is a materially different
implementation from the plain one, not a themed variant of it). Circular wavy reuses the
exact `RoundedPolygon`/`Morph` port already built for LoadingIndicator (see below):
Compose's `CircularShapes` morphs a `RoundedPolygon.circle` into a
`RoundedPolygon.star(innerRadius=0.75, rounding=0.35/0.4, innerRounding=0.5)` with vertex
count `round(2πr/wavelength)` — since our wavy container is a fixed 48px/4px-stroke/15dp-
wavelength (WaveSize/ActiveThickness/ActiveWaveWavelength tokens), that count is a build-
time constant (9), so `scripts/build-circular-progress-shapes.mjs` bakes the matched
circle↔star cubics once into `src/generated/circular-progress-shapes.ts` exactly like
`build-loading-indicator-shapes.mjs` does, and the component only does the same per-t
lerp (factored out to `src/utils/morphPath.ts`, shared by both). Linear wavy has no
material-web or existing-port equivalent, so its repeating quadratic-Bezier sine template
(`buildWaveD`) is generated directly from `LinearProgressIndicatorTokens`: control-point Y
of `height - strokeWidth` peaks at exactly half that at the curve's midpoint — which is
where `ActiveWaveAmplitude` (3dp, for a 10dp-tall/4dp-stroke wavy track) comes from, a
useful check when porting the formula. Both wavy shapes are drawn via `pathLength={100}` +
`stroke-dasharray`/`stroke-dashoffset`, exactly like the plain circular indicator's
determinate-circle trick — **critically**, the CSS `d` property (used to cross-fade
between a flat/circle shape and a wavy/star one on amplitude changes, so the browser
interpolates same-structure path commands smoothly) requires its value wrapped in
`path("...")`; a bare path-data string is silently accepted as a string but never
rendered (no error, path just has zero geometry — caught by checking `getBBox()`/
`getTotalLength()` are non-zero, not by any visible error). Progress-fraction distances
are converted to `pathLength`-normalized dasharray/dashoffset via a single proportional
scale (position ÷ full extended-template width × 100) rather than true per-point arc-
length — Compose's own `updateFullPaths`/`updateDrawPaths` do the exact same
single-scalar approximation (a comment there even flags the mismatch), so this isn't a
fidelity shortcut, it's matching upstream's own simplification. The "wave motion" (crests
appear to travel while the drawn arc's start/end stay fixed) is a shift-then-correct
trick in both shapes: sample the periodic template's geometry from a phase further along
(`stroke-dashoffset`), then translate/rotate the whole element back by that same amount
(`transform: translateX()` for linear, `rotate()` for circular) — mirroring Compose's own
"extract shifted, translate back" step in `updateDrawPaths`. Linear's determinate wavy
amplitude ramp and wave-phase motion are pure CSS (`@property`-registered custom
properties + `calc()`, no rAF) since both are simple per-render or continuously-linear
values; linear's _indeterminate_ wavy bars need a small `requestAnimationFrame` loop
instead (mirroring LoadingIndicator's pattern) because their moving window itself
(head/tail fractions) has to be recomputed every frame in JS to feed the `dasharray`
math, not just a single continuously-interpolating CSS value like the rotation-only
circular case.

Next candidates: TextField, Select (MD3 specs it as a menu opened from a text field —
build after TextField; Base UI Select's `alignItemWithTrigger` must be false), dynamic
color theming, rem-based type scaling (see Units decision), npm publish setup (finalize
package name), docs site content + deploy.

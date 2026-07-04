- [x] Work on the animation timing of morph expansion of toggle buttons. The morph animation starts after ripple animation leading to a visual delay.
      Root cause was not easing: round rested at `corner-full` (9999px), so the
      border-radius transition stayed above the geometric clamp (height/2) for ~99% of
      its duration and only the tail end was visible. Fixed by resting round at
      `calc(height/2)` and animating with the new `--md-sys-motion-easing-fast-spatial`
      spring curve (800/0.6 as CSS `linear()`, 350ms).
- [ ] Shiki output duplicates the palette on every token: each span carries inline
      `--shiki-light/--shiki-dark` style attrs (stock dual-theme output). Revisit
      emitting classes instead, backed by one static stylesheet — the full rule set
      is enumerable from the two theme palettes (theme fg + settings foregrounds +
      the fixed font-style universe), so it can be generated once at config time;
      a first attempt (`shikiClassTransformer` + `md3:shiki-css`) was reverted as
      too much machinery, see git history.
- [x] ButtonGroup connected inner corners have the same clamp artifact: selected/pressed
      inner corner animates 8px↔`corner-full` (9999px), so the round-out snaps instead
      of morphing. Fixed: Button publishes `--md3-shape-round` (= height/2) and the
      group's full-corner values consume it via
      `var(--md3-shape-round, var(--md-sys-shape-corner-full))` — children that don't
      publish it (IconButton today) keep the old corner-full fallback.

- [ ] Shiki output duplicates the palette on every token: each span carries inline
      `--shiki-light/--shiki-dark` style attrs (stock dual-theme output). Revisit
      emitting classes instead, backed by one static stylesheet — the full rule set
      is enumerable from the two theme palettes (theme fg + settings foregrounds +
      the fixed font-style universe), so it can be generated once at config time;
      a first attempt (`shikiClassTransformer` + `md3:shiki-css`) was reverted as
      too much machinery, see git history.
- [ ] SplitButtonMenu does not set aria-haspopup="menu" (or aria-expanded={false} default)
      itself — SplitButton.tsx:77-104. When composed with Base UI Menu.Trigger this comes
      free, but standalone usage (as in the shipped demo) has no popup semantics until the
      consumer adds them. Minor; consider defaulting aria-haspopup.
- [ ] Actionable card: a clickable/focusable Card mode (Compose ships `Card(onClick)`)
      with ripple + state layer, focus ring, and the per-variant state tokens already
      in component-specs.json — hover/pressed elevation shifts (elevated: level1→2),
      outlined hover outline-variant, plus disabled (38% content / container opacity,
      only meaningful here). Needs 'use client'; keep the static Card server-safe
      (separate export or prop-gated wrapper). Dragged state optional (data-dragged
      hook only). Selectable/checkable cards are a separate follow-up.

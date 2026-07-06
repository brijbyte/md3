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
- [ ] Selectable/checkable cards (follow-up to ActionableCard, shipped 2026-07).
- [ ] Chips follow-ups (v1 shipped 2026-07): trailing/remove icon on FilterChip (material-web
      `removable`, pairs with the future Menu for dropdown filter chips); a ChipSet wrapper
      (layout + arrow-key nav across chips/actions, cf. material-web chip-set); InputChip
      arrow-key nav between primary and remove actions (multi-action-chip.ts); consider a
      `removeIcon` override slot on InputChip.
- [ ] CircularProgress wavy variant still not right despite two rounds of fixes (baked
      circle/star morph rotational alignment, then the missing `%` unit on the determinate
      wave-phase `stroke-dashoffset` compensation — see git history on CircularProgress.tsx /
      build-circular-progress-shapes.mjs). User remains unhappy with the visual result;
      needs a fresh look, possibly reconsidering the whole dasharray/dashoffset + rotate
      approach vs. something closer to Compose's actual PathMeasure-based
      double-length-path + getSegment technique (see CircularWavyProgressModifiers.kt),
      since the CSS approximation may inherently drift for a non-circular (star) path.
- [ ] Tooltip/RichTooltip have no mobile long-press gesture (shipped 2026-07). Base UI's
      Tooltip/PreviewCard triggers are hover/focus-driven only; on a real touchscreen
      there's no native hover, so a tap just fires the trigger's own click action and the
      tooltip never appears. Compose Material3's spec (`BasicTooltip.kt` `handleGestures`)
      shows the tooltip on a held long-press and `consume()`s that pointer event so the
      trigger's tap-through doesn't also fire; a quick tap is left alone. Would need a
      custom long-press handler added to `TooltipTrigger`/`RichTooltipTrigger` to match.

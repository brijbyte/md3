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

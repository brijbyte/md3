- [x] Work on the animation timing of morph expansion of toggle buttons. The morph animation starts after ripple animation leading to a visual delay.
      Root cause was not easing: round rested at `corner-full` (9999px), so the
      border-radius transition stayed above the geometric clamp (height/2) for ~99% of
      its duration and only the tail end was visible. Fixed by resting round at
      `calc(height/2)` and animating with the new `--md-sys-motion-easing-fast-spatial`
      spring curve (800/0.6 as CSS `linear()`, 350ms).
- [ ] ButtonGroup connected inner corners have the same clamp artifact: selected/pressed
      inner corner animates 8px↔`corner-full` (9999px), so the round-out snaps instead
      of morphing. Needs a height-derived radius, but group children are arbitrary
      components whose height the group CSS can't know — maybe have each button expose
      its `--_shape-round` publicly (e.g. `--md3-shape-round`) for the group to consume.

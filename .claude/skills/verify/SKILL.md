---
name: verify
description: Build/launch/drive recipe for visually verifying component changes in the docs app.
---

# Verifying changes in the docs app

Node 26 required: `export PATH="$HOME/.nvm/versions/node/v26.4.0/bin:$PATH"`.

1. `pnpm dev` (repo root, background) — Vite prints the actual port (5173 may be taken;
   check the log, don't assume). Library source is aliased, so `packages/react/src` edits
   are live without a rebuild.
2. Routes are `/<section>/<page>` from `apps/docs/src/nav.ts` (e.g. `/components/checkbox`).
3. Drive with `playwright-core` (install in scratchpad; browsers already cached at
   `~/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/Google Chrome for
Testing.app/Contents/MacOS/Google Chrome for Testing`).
4. Gotchas:
   - SSR HTML is a pre-hydration shell; wait ~1.5s after `networkidle` before clicking,
     or clicks silently no-op.
   - Base UI checkboxes/radios render as `[role="checkbox"]` spans, not `<button>`.
   - Dark theme: `document.documentElement.setAttribute("data-theme", "dark")`.
   - `getByText` also matches the demo's collapsed source-code tab — use
     `{ exact: true }` or scope to the `.demo-*` container. Prefer element locators
     over raw mouse coordinates; coordinate clicks silently miss.
5. Screenshot the demo container (`.demo-*` class) per state; check light + dark.

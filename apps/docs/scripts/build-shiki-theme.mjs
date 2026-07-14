// Emits src/components/shiki-theme.css (gitignored) — the sk-* classes and
// css-var values the generated shiki theme in satteri/shiki.mjs references.
// Invoked from next.config.ts before every dev/build; write is skipped when
// unchanged so watchers don't rebuild.
import fs from "node:fs";
import path from "node:path";
import { getShikiThemeCss } from "../satteri/shiki.mjs";

const OUT = path.join(import.meta.dirname, "../src/components/shiki-theme.css");

export async function buildShikiTheme() {
  const css = await getShikiThemeCss();
  if (fs.existsSync(OUT) && fs.readFileSync(OUT, "utf8") === css) return;
  fs.writeFileSync(OUT, css);
}

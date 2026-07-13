import { readFileSync, writeFileSync } from "node:fs";

// Skip identical writes: generated files are in the module graph, so touching
// them on every buildStart would make `vite build --watch` retrigger forever.
export function writeIfChanged(path, contents) {
  try {
    if (readFileSync(path, "utf8") === contents) return;
  } catch {}
  writeFileSync(path, contents);
}

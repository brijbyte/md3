// satteri's compile rewrites relative import extensions to .js
// ("./demo/x.tsx" → "./demo/x.js"), which Turbopack won't resolve back to the
// TS source; restore the on-disk extension so the specifiers resolve.
import fs from "node:fs";
import path from "node:path";

const REL_JS_IMPORT_RE = /(["'])(\.{1,2}\/[^"']+)\.js\1/g;

/* oxlint-disable oxc/no-this-in-exported-function -- webpack loader API: context is `this` */
export default function restoreExtensions(source) {
  const fromDir = path.dirname(this.resourcePath);
  return String(source).replace(REL_JS_IMPORT_RE, (full, quote, base) => {
    if (fs.existsSync(path.join(fromDir, `${base}.js`))) return full;
    const ext = [".tsx", ".ts", ".jsx"].find((e) => fs.existsSync(path.join(fromDir, base + e)));
    return ext ? `${quote}${base}${ext}${quote}` : full;
  });
}

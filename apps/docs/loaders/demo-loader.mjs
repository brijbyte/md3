// Demo facade loader, the Next.js port of the old vite md3:demos plugin.
// Runs on the JS that satteri-nextjs/loader emits for a page.mdx (chained
// after it — webpack and Turbopack both execute `loaders` right-to-left).
//
// A page imports a demo by its real path ("./demo/button-sizes.tsx" —
// clickable, typo = resolve error) and renders it directly. This loader
// rewrites each such import so the binding becomes the entry component
// wrapped in the <Demo> chrome (playground + highlighted-source tabs):
//
//   import ButtonSizes from "./demo/button-sizes.tsx";
//     ⇢ import __demo$0 from "./demo/button-sizes.tsx";
//       const ButtonSizes = __createDemo(__demo$0, [{ name, code, html }, …]);
//
// The demo's showable sources (entry + relative imports + sibling css) are
// read and Shiki-highlighted here at compile time and inlined — the page is
// a server component, so the payload never ships as client JS. Every file
// read is registered as a loader dependency, so demo edits recompile the page.
import fs from "node:fs";
import path from "node:path";

// Mirrors SHIKI_THEMES in satteri/hast-plugins.mjs (kept local: this module
// must stay dependency-light so both bundlers can run it as a plain loader).
const SHIKI_THEMES = { light: "github-light-default", dark: "github-dark-dimmed" };

// Lazy singleton so shiki loads once per process, not per page.
let shikiPromise;
async function highlight(code, lang) {
  shikiPromise ??= import("shiki");
  const { codeToHtml } = await shikiPromise;
  return codeToHtml(code.replace(/\n$/, ""), {
    lang,
    themes: SHIKI_THEMES,
    defaultColor: false,
  });
}

// A demo's showable sources: the entry file plus its relative imports, breadth-first
// (extensionless specifiers try .tsx/.ts; css imports are included verbatim).
function collectDemoFiles(dir, entry) {
  const files = [];
  const queue = [entry];
  while (queue.length) {
    const rel = queue.shift();
    if (files.includes(rel)) continue;
    files.push(rel);
    if (!/\.[jt]sx?$/.test(rel)) continue;
    const src = fs.readFileSync(path.join(dir, rel), "utf8");
    for (const m of src.matchAll(/(?:from|import)\s+["']\.\/([^"']+)["']/g)) {
      const hit = [m[1], `${m[1]}.tsx`, `${m[1]}.ts`].find((f) => fs.existsSync(path.join(dir, f)));
      if (hit) queue.push(hit);
    }
  }
  return files;
}

// satteri's compile rewrites relative import extensions to .js
// ("./demo/x.tsx" → "./demo/x.js"); restore the on-disk extension so the
// specifiers resolve (and so the demo regex below sees the real files).
const REL_JS_IMPORT_RE = /(["'])(\.{1,2}\/[^"']+)\.js\1/g;
function restoreSourceExtensions(source, fromDir) {
  return source.replace(REL_JS_IMPORT_RE, (full, quote, base) => {
    if (fs.existsSync(path.join(fromDir, `${base}.js`))) return full;
    const ext = [".tsx", ".ts", ".jsx"].find((e) => fs.existsSync(path.join(fromDir, base + e)));
    return ext ? `${quote}${base}${ext}${quote}` : full;
  });
}

// Default-imported sibling demos only; demo-internal helpers (./row) and any
// other relative import don't match and resolve normally.
const DEMO_IMPORT_RE = /import\s+([A-Za-z_$][\w$]*)\s+from\s*["']\.\/demo\/([\w-]+)\.tsx["'];?/g;

async function transform(source, ctx) {
  source = restoreSourceExtensions(source, path.dirname(ctx.resourcePath));
  const matches = [...source.matchAll(DEMO_IMPORT_RE)];
  if (matches.length === 0) return source;

  const dir = path.join(path.dirname(ctx.resourcePath), "demo");
  const { createDemo } = ctx.getOptions();
  // Relative specifier so both bundlers resolve it without alias setup.
  let createDemoSpec = path
    .relative(path.dirname(ctx.resourcePath), createDemo)
    .split(path.sep)
    .join("/");
  if (!createDemoSpec.startsWith(".")) createDemoSpec = `./${createDemoSpec}`;

  let out = source;
  const facades = [];
  for (let i = 0; i < matches.length; i++) {
    const [stmt, binding, name] = matches[i];
    const rels = collectDemoFiles(dir, `${name}.tsx`);
    // The entry tsx usually imports its sibling css; add it if it didn't.
    const style = `${name}.css`;
    if (!rels.includes(style) && fs.existsSync(path.join(dir, style))) rels.push(style);
    const files = [];
    for (const rel of rels) {
      const abs = path.join(dir, rel);
      ctx.addDependency(abs);
      const code = fs.readFileSync(abs, "utf8");
      files.push({ name: rel, code, html: await highlight(code, path.extname(rel).slice(1)) });
    }
    out = out.replace(stmt, `import __demo$${i} from "./demo/${name}.tsx";`);
    facades.push(`const ${binding} = __createDemo(__demo$${i}, ${JSON.stringify(files)});`);
  }

  return (
    `import { createDemo as __createDemo } from ${JSON.stringify(createDemoSpec)};\n` +
    `${out}\n${facades.join("\n")}\n`
  );
}

/* oxlint-disable oxc/no-this-in-exported-function -- webpack loader API: context is `this` */
export default function demoLoader(source) {
  const callback = this.async();
  transform(String(source), this).then(
    (code) => callback(null, code),
    (err) => callback(err instanceof Error ? err : new Error(String(err))),
  );
}

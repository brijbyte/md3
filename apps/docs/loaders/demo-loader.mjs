// Runs on the demo sources themselves (src/app/**/demo/*.tsx, wired in
// next.config.ts) — pages import a demo by its real path and render it
// directly; nothing rewrites the page. A demo entry (= file with a default
// export) is wrapped in the <Demo> chrome (playground + highlighted-source
// tabs) at its own module:
//
//   export default function ButtonSizes() {…}
//     ⇢ const __DemoEntry = function ButtonSizes() {…};
//       export default __createDemo(__DemoEntry, [{ name, code, html }, …]);
//
// The demo's showable sources (entry + relative imports + sibling css) are
// read and Shiki-highlighted here at compile time and inlined; every file
// read is registered as a loader dependency, so edits recompile the demo.
// Helper modules in demo/ (no default export) pass through untouched. All
// matching is AST-based via yuku-parser, applied as span edits.
import fs from "node:fs";
import path from "node:path";
import { langFromPath, parse, walk } from "yuku-parser";

// Mirrors SHIKI_THEMES in satteri/hast-plugins.mjs (kept local: this module
// must stay dependency-light so both bundlers can run it as a plain loader).
const SHIKI_THEMES = { light: "github-light-default", dark: "github-dark-dimmed" };

// Lazy singleton so shiki loads once per process, not per demo.
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

// Same-dir ("./…") import/re-export specifiers of a source file.
function relativeImports(code, file) {
  const specs = [];
  const collect = (node) => {
    if (node.source?.value.startsWith("./")) specs.push(node.source.value.slice(2));
  };
  const { program } = parse(code, { lang: langFromPath(file), sourceType: "module" });
  walk(program, {
    ImportDeclaration: collect,
    ExportNamedDeclaration: collect,
    ExportAllDeclaration: collect,
  });
  return specs;
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
    for (const spec of relativeImports(src, rel)) {
      const hit = [spec, `${spec}.tsx`, `${spec}.ts`].find((f) => fs.existsSync(path.join(dir, f)));
      if (hit) queue.push(hit);
    }
  }
  return files;
}

// Relative specifier so both bundlers resolve it without alias setup.
function relativeSpecifier(fromFile, target) {
  const spec = path.relative(path.dirname(fromFile), target).split(path.sep).join("/");
  return spec.startsWith(".") ? spec : `./${spec}`;
}

// A leading 'use client' must stay the first statement — the facade import is
// inserted after it.
const DIRECTIVE_RE = /^\s*(['"])use client\1;?[^\S\n]*\n/;

async function transform(source, ctx) {
  const { createDemo } = ctx.getOptions();

  const { program } = parse(source, {
    lang: langFromPath(ctx.resourcePath),
    sourceType: "module",
  });
  let defaultExport;
  walk(program, {
    ExportDefaultDeclaration(node) {
      defaultExport = node;
    },
  });
  // Demo-internal helpers (./row) have no default export and stay untouched.
  if (!defaultExport) return source;

  const dir = path.dirname(ctx.resourcePath);
  const entry = path.basename(ctx.resourcePath);
  const rels = collectDemoFiles(dir, entry);
  // The entry tsx usually imports its sibling css; add it if it didn't.
  const style = entry.replace(/\.tsx$/, ".css");
  if (!rels.includes(style) && fs.existsSync(path.join(dir, style))) rels.push(style);
  const files = [];
  for (const rel of rels) {
    const abs = path.join(dir, rel);
    if (abs !== ctx.resourcePath) ctx.addDependency(abs);
    const code = abs === ctx.resourcePath ? source : fs.readFileSync(abs, "utf8");
    files.push({ name: rel, code, html: await highlight(code, path.extname(rel).slice(1)) });
  }

  const importAt = DIRECTIVE_RE.exec(source)?.[0].length ?? 0;
  const { declaration } = defaultExport;
  // The declaration slice stays valid as an expression for every shape a demo
  // uses (named function declaration, arrow, identifier).
  const edits = [
    {
      start: importAt,
      end: importAt,
      text: `import { createDemo as __createDemo } from ${JSON.stringify(relativeSpecifier(ctx.resourcePath, createDemo))};\n`,
    },
    {
      start: defaultExport.start,
      end: defaultExport.end,
      text: `const __DemoEntry = ${source.slice(declaration.start, declaration.end)};`,
    },
  ];

  // Apply span edits bottom-up so earlier offsets stay valid.
  let out = source;
  for (const { start, end, text } of edits.toSorted((a, b) => b.start - a.start)) {
    out = out.slice(0, start) + text + out.slice(end);
  }
  return `${out}\nexport default __createDemo(__DemoEntry, ${JSON.stringify(files)});\n`;
}

/* oxlint-disable oxc/no-this-in-exported-function -- webpack loader API: context is `this` */
export default function demoLoader(source) {
  const callback = this.async();
  transform(String(source), this).then(
    (code) => callback(null, code),
    (err) => callback(err instanceof Error ? err : new Error(String(err))),
  );
}

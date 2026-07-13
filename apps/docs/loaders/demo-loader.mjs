// Two rewrites, both span-based edits on the compiled module:
//
// 1. Demo facades. A page imports a demo by its real path
//    ("./demo/button-sizes.tsx" — clickable, typo = resolve error) and
//    renders it directly. Each such import is rewritten so the binding
//    becomes the entry component wrapped in the <Demo> chrome (playground +
//    highlighted-source tabs):
//
//      import ButtonSizes from "./demo/button-sizes.tsx";
//        ⇢ import __demo$0 from "./demo/button-sizes.tsx";
//          const ButtonSizes = __createDemo(__demo$0, [{ name, code, html }, …]);
//
//    The demo's showable sources (entry + relative imports + sibling css) are
//    read and Shiki-highlighted here at compile time and inlined — the page is
//    a server component, so the payload never ships as client JS. Every file
//    read is registered as a loader dependency, so demo edits recompile the page.
//
// 2. Page facades. page.mdx files under src/app/ ARE the routes (mdx is in
//    `pageExtensions`), so the default export is wrapped in the <DocsPage>
//    chrome (title/description from nav.ts, satteri's `toc` export as the
//    rail) and `export const metadata = routeMetadata(path)` is emitted, with
//    the route derived from the file's app-dir location (route groups
//    stripped). This replaces the old per-route page.tsx boilerplate.
import fs from "node:fs";
import path from "node:path";
import { langFromPath, parse, walk } from "yuku-parser";

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

// satteri's compile rewrites relative import extensions to .js
// ("./demo/x.tsx" → "./demo/x.js"); restore the on-disk extension so the
// specifiers resolve (and so the demo-import matching sees the real files).
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
const DEMO_SOURCE_RE = /^\.\/demo\/([\w-]+)\.tsx$/;

// Relative specifier so both bundlers resolve it without alias setup.
function relativeSpecifier(fromFile, target) {
  const spec = path.relative(path.dirname(fromFile), target).split(path.sep).join("/");
  return spec.startsWith(".") ? spec : `./${spec}`;
}

// "/components/badge" from "<appDir>/(docs)/components/badge/page.mdx" —
// route groups don't contribute URL segments.
function routeFromPage(appDir, resourcePath) {
  const segments = path
    .relative(appDir, path.dirname(resourcePath))
    .split(path.sep)
    .filter((seg) => !seg.startsWith("("));
  return `/${segments.join("/")}`;
}

async function transform(source, ctx) {
  source = restoreSourceExtensions(source, path.dirname(ctx.resourcePath));
  const { createDemo, docsPage, nav, appDir } = ctx.getOptions();

  // One AST pass over the compiled module: demo imports + the default export.
  const { program } = parse(source, { lang: "js", sourceType: "module" });
  const demoImports = [];
  let defaultExport;
  walk(program, {
    ImportDeclaration(node) {
      const name = node.source.value.match(DEMO_SOURCE_RE)?.[1];
      const [spec] = node.specifiers;
      if (name && node.specifiers.length === 1 && spec.type === "ImportDefaultSpecifier") {
        demoImports.push({ start: node.start, end: node.end, binding: spec.local.name, name });
      }
    },
    ExportDefaultDeclaration(node) {
      defaultExport = node;
    },
  });

  const isPage =
    path.basename(ctx.resourcePath) === "page.mdx" &&
    !path.relative(appDir, ctx.resourcePath).startsWith("..") &&
    !!defaultExport;
  if (demoImports.length === 0 && !isPage) return source;

  const edits = [];
  const prelude = [];
  const facades = [];

  if (demoImports.length > 0) {
    prelude.push(
      `import { createDemo as __createDemo } from ${JSON.stringify(relativeSpecifier(ctx.resourcePath, createDemo))};`,
    );
    const dir = path.join(path.dirname(ctx.resourcePath), "demo");
    for (let i = 0; i < demoImports.length; i++) {
      const { start, end, binding, name } = demoImports[i];
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
      edits.push({ start, end, text: `import __demo$${i} from "./demo/${name}.tsx";` });
      facades.push(`const ${binding} = __createDemo(__demo$${i}, ${JSON.stringify(files)});`);
    }
  }

  if (isPage) {
    const route = routeFromPage(appDir, ctx.resourcePath);
    prelude.push(
      `import { jsx as __jsx } from "react/jsx-runtime";`,
      `import { DocsPage as __DocsPage } from ${JSON.stringify(relativeSpecifier(ctx.resourcePath, docsPage))};`,
      `import { routeMetadata as __routeMetadata } from ${JSON.stringify(relativeSpecifier(ctx.resourcePath, nav))};`,
    );
    const { declaration } = defaultExport;
    // `toc` is satteri's own export (appended after this span, hence the
    // render-time reference); the declaration slice stays valid as an
    // expression for every shape satteri emits (identifier or function).
    edits.push({
      start: defaultExport.start,
      end: defaultExport.end,
      text:
        `const __PageContent = ${source.slice(declaration.start, declaration.end)};\n` +
        `export const metadata = __routeMetadata(${JSON.stringify(route)});\n` +
        `export default function DocsRoute(props) {\n` +
        `  return __jsx(__DocsPage, { path: ${JSON.stringify(route)}, toc, children: __jsx(__PageContent, props) });\n` +
        `}`,
    });
  }

  // Apply span edits bottom-up so earlier offsets stay valid.
  let out = source;
  for (const { start, end, text } of edits.toSorted((a, b) => b.start - a.start)) {
    out = out.slice(0, start) + text + out.slice(end);
  }
  return `${prelude.join("\n")}\n${out}\n${facades.join("\n")}\n`;
}

/* oxlint-disable oxc/no-this-in-exported-function -- webpack loader API: context is `this` */
export default function demoLoader(source) {
  const callback = this.async();
  transform(String(source), this).then(
    (code) => callback(null, code),
    (err) => callback(err instanceof Error ? err : new Error(String(err))),
  );
}

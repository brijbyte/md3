// Emits a dist/<path>/<Name>.module.d.ts next to each compiled <Name>.module.js,
// typing its class-name-map export. typed-css-modules generates the same token
// map it writes for the src *.module.css.d.ts, but the dist module is an ESM
// default export (`export { map as default }`), so `export = styles` is swapped
// for `export default styles`.
import { existsSync, globSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import DtsCreatorImport from "typed-css-modules";

const DtsCreator = DtsCreatorImport.default ?? DtsCreatorImport;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const distDir = join(root, "dist");

export async function emitCssModuleDts() {
  const creator = new DtsCreator();
  await Promise.all(
    globSync(join(srcDir, "**/*.module.css")).map(async (file) => {
      const rel = relative(srcDir, file).replace(/\.module\.css$/, ".module");
      const jsPath = join(distDir, `${rel}.js`);
      if (!existsSync(jsPath)) return; // module wasn't bundled — skip

      const content = await creator.create(file);
      const dts = content.formatted
        .replace("export = styles;", "export default styles;")
        .replace(/\n+$/, "\n");

      const outPath = join(distDir, `${rel}.d.ts`);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, dts);
    }),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await emitCssModuleDts();
  console.log("css module .d.ts emitted into dist");
}

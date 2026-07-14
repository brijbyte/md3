// Pass-through loader on *.mdx (appended last in the chain, so it runs first
// and sees the raw MDX source): refreshes the page's search-index fragment and
// re-merges public/search-index*.json whenever the page recompiles. The full
// baseline is seeded at config load (see scripts/build-search-index.mjs) —
// this keeps it fresh during dev without a separate watcher. An index failure
// only warns: it must never fail the page's compile.
import { updateSearchIndex } from "../scripts/build-search-index.mjs";

/* oxlint-disable oxc/no-this-in-exported-function -- webpack loader API: context is `this` */
export default function searchIndexLoader(source) {
  if (!this.resourcePath.endsWith("page.mdx")) return source;
  const callback = this.async();
  updateSearchIndex(this.resourcePath, String(source)).then(
    () => callback(null, source),
    (err) => {
      this.emitWarning(new Error(`search-index: ${err instanceof Error ? err.message : err}`));
      callback(null, source);
    },
  );
}

"use client";

import "./icon-browser.css";

import * as React from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { FilterChip } from "@brijbyte/md3-react/chip";
import { LoadingIndicator } from "@brijbyte/md3-react/loading-indicator";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@brijbyte/md3-react/menu";
import { SnackbarProvider, useSnackbar } from "@brijbyte/md3-react/snackbar";
import { SplitButton, SplitButtonAction, SplitButtonMenu } from "@brijbyte/md3-react/split-button";
import { TextField } from "@brijbyte/md3-react/text-field";
import { Typography } from "@brijbyte/md3-react/typography";
import { iconRefs, matchesToken, searchToken } from "./icon-browser-utils";
import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import ArrowDropDownIcon from "@brijbyte/md3-icons/outlined/ArrowDropDown";
import SearchIcon from "@brijbyte/md3-icons/outlined/Search";

const VIEWBOX = "0 -960 960 960";
const DATA_BASE = `${import.meta.env.BASE_URL}icons-data/`;
const STYLES = ["outlined", "rounded", "sharp"] as const;
type Style = (typeof STYLES)[number];

// Variant chunk size — must match VARIANT_CHUNK in scripts/build-icon-data.mjs.
const VARIANT_CHUNK = 128;
// The 6 per-icon variant paths are stored in this order (COMBOS order in the generator).
// The detail card groups them by style, each showing its unfilled + filled form.
const VARIANT_STYLES: { style: Style; label: string; unfilled: number; filled: number }[] = [
  { style: "outlined", label: "Outlined", unfilled: 0, filled: 1 },
  { style: "rounded", label: "Rounded", unfilled: 2, filled: 3 },
  { style: "sharp", label: "Sharp", unfilled: 4, filled: 5 },
];

// Grid geometry (matches the CSS): min cell width and gap, in px.
const CELL_MIN = 64;
const GAP = 4;

// [snake_name, PascalName] per base icon; the path arrays are index-aligned.
type IconIndex = [name: string, pascal: string][];

// Fetch-once caches, module-scoped so switching variants back and forth is instant.
let indexPromise: Promise<IconIndex> | undefined;
const pathCache = new Map<string, Promise<string[]>>();
const variantChunkCache = new Map<number, Promise<string[][]>>();

function loadIndex() {
  return (indexPromise ??= fetch(`${DATA_BASE}index.json`).then((r) => r.json()));
}
function loadPaths(combo: string) {
  let p = pathCache.get(combo);
  if (!p) {
    p = fetch(`${DATA_BASE}${combo}.json`).then((r) => r.json());
    pathCache.set(combo, p);
  }
  return p;
}
// The 6 variant paths for one icon, via its (cached) chunk file.
function loadVariants(iconIndex: number): Promise<string[]> {
  const chunk = Math.floor(iconIndex / VARIANT_CHUNK);
  let p = variantChunkCache.get(chunk);
  if (!p) {
    p = fetch(`${DATA_BASE}variants/chunk-${chunk}.json`).then((r) => r.json());
    variantChunkCache.set(chunk, p);
  }
  return p.then((rows) => rows[iconIndex - chunk * VARIANT_CHUNK]);
}

export default function IconBrowser() {
  return (
    <SnackbarProvider>
      <IconBrowserInner />
    </SnackbarProvider>
  );
}

function IconBrowserInner() {
  const { showSnackbar } = useSnackbar();
  const [style, setStyle] = React.useState<Style>("outlined");
  const [fill, setFill] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<number | null>(null);
  const [scrollTo, setScrollTo] = React.useState<number | null>(null);

  const [index, setIndex] = React.useState<IconIndex | null>(null);
  const [paths, setPaths] = React.useState<string[] | null>(null);
  const [pending, setPending] = React.useState(false);
  const [variantPaths, setVariantPaths] = React.useState<string[] | null>(null);
  const combo = fill ? `${style}-fill` : style;

  React.useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  // Load the selected icon's 6 variant paths (for the compare strip in the detail card).
  React.useEffect(() => {
    if (selected == null) {
      setVariantPaths(null);
      return;
    }
    let active = true;
    loadVariants(selected).then((v) => active && setVariantPaths(v));
    return () => {
      active = false;
    };
  }, [selected]);

  // Load the active style×fill path data. Keep the previous glyphs rendered until the
  // new set arrives (no unmount → no layout shift); a `pending` flag just dims the grid.
  React.useEffect(() => {
    let active = true;
    setPending(true);
    loadPaths(combo).then((p) => {
      if (!active) return;
      setPaths(p);
      setPending(false);
    });
    return () => {
      active = false;
    };
  }, [combo]);

  const q = React.useMemo(() => searchToken(query), [query]);

  // The visible slice: full indices matching the query, or null for "everything"
  // (null avoids materializing a 4k-element identity array on the common path).
  const view = React.useMemo(() => {
    if (!index || !q) return null;
    const out: number[] = [];
    for (let i = 0; i < index.length; i++) {
      if (matchesToken(index[i][0], index[i][1], q)) out.push(i);
    }
    return out;
  }, [index, q]);
  const resultCount = view ? view.length : (index?.length ?? 0);

  // Browser find matched a filtered-out icon: drop the filter, select it, scroll to it.
  const handleReveal = React.useCallback((i: number) => {
    setQuery("");
    setSelected(i);
    setScrollTo(i);
  }, []);

  const copy = (label: string, text: string) => {
    navigator.clipboard?.writeText(text);
    showSnackbar(`Copied ${label}`);
  };

  const sel =
    selected != null && index && paths
      ? { ...iconRefs(index[selected][0], index[selected][1], style, fill), d: paths[selected] }
      : null;

  return (
    <div className="icon-browser">
      <div className="icon-browser-header">
        <div className="icon-browser-controls">
          <div className="icon-browser-chip-groups">
            <div className="icon-browser-chip-group" role="group" aria-label="Icon style">
              <Typography as="span" variant="label-large" className="icon-browser-chip-label">
                Style
              </Typography>
              {STYLES.map((s) => (
                <FilterChip key={s} pressed={style === s} onPressedChange={(p) => p && setStyle(s)}>
                  {s[0].toUpperCase() + s.slice(1)}
                </FilterChip>
              ))}
            </div>
            <div className="icon-browser-chip-group" role="group" aria-label="Fill">
              <Typography as="span" variant="label-large" className="icon-browser-chip-label">
                Fill
              </Typography>
              <FilterChip pressed={fill} onPressedChange={setFill}>
                Filled
              </FilterChip>
            </div>
          </div>

          <TextField
            variant="outlined"
            label="Search icons"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leadingIcon={<SearchIcon />}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="icon-browser-detail">
          {sel ? (
            <>
              {variantPaths ? (
                <div className="icon-browser-variants" role="group" aria-label="Style variants">
                  {VARIANT_STYLES.map((v) => (
                    <div className="icon-browser-variant-col" key={v.style}>
                      <div className="icon-browser-variant-swatches">
                        {[
                          { d: variantPaths[v.unfilled], f: false },
                          { d: variantPaths[v.filled], f: true },
                        ].map(({ d, f }) => (
                          <button
                            key={f ? "fill" : "outline"}
                            type="button"
                            className="icon-browser-variant"
                            data-active={style === v.style && fill === f ? "" : undefined}
                            aria-pressed={style === v.style && fill === f}
                            title={f ? `${v.label} · filled` : v.label}
                            aria-label={f ? `${v.label} filled` : v.label}
                            onClick={() => {
                              setStyle(v.style);
                              setFill(f);
                            }}
                          >
                            <svg viewBox={VIEWBOX} fill="currentColor" aria-hidden>
                              <path d={d} />
                            </svg>
                          </button>
                        ))}
                      </div>
                      <Typography
                        as="span"
                        variant="label-small"
                        className="icon-browser-variant-label"
                      >
                        {v.label}
                      </Typography>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="icon-browser-detail-preview">
                  <svg viewBox={VIEWBOX} fill="currentColor" aria-hidden>
                    <path d={sel.d} />
                  </svg>
                </div>
              )}
              <div className="icon-browser-detail-text">
                <Typography as="span" variant="title-medium" className="icon-browser-detail-name">
                  {sel.component}
                </Typography>
                <Typography as="code" variant="body-small" className="icon-browser-detail-path">
                  {sel.path}
                </Typography>
              </div>
              <div className="icon-browser-detail-actions">
                <SplitButton variant="tonal" size="xsmall">
                  <SplitButtonAction
                    icon={<ContentCopyIcon />}
                    onClick={() => copy("import", sel.importLine)}
                  >
                    Copy import
                  </SplitButtonAction>
                  <Menu>
                    <MenuTrigger render={<SplitButtonMenu aria-label="More copy options" />}>
                      <ArrowDropDownIcon />
                    </MenuTrigger>
                    <MenuContent>
                      <MenuItem onClick={() => copy("name", sel.name)}>Copy name</MenuItem>
                      <MenuItem onClick={() => copy("component", `<${sel.component} />`)}>
                        Copy component
                      </MenuItem>
                      <MenuItem onClick={() => copy("import path", sel.path)}>
                        Copy import path
                      </MenuItem>
                    </MenuContent>
                  </Menu>
                </SplitButton>
              </div>
            </>
          ) : (
            <Typography as="span" variant="body-medium" className="icon-browser-detail-empty">
              Select an icon to copy its name, component, or import.
            </Typography>
          )}
        </div>
      </div>

      <Typography as="p" variant="body-small" className="icon-browser-count">
        {index ? `${resultCount.toLocaleString()} icon${resultCount === 1 ? "" : "s"}` : " "}
      </Typography>

      {index && paths ? (
        <>
          {resultCount === 0 ? (
            <p className="icon-browser-empty">No icons match “{query}”.</p>
          ) : (
            <IconGrid
              index={index}
              paths={paths}
              view={view}
              selected={selected}
              pending={pending}
              onSelect={setSelected}
              scrollTo={scrollTo}
              onScrolled={() => setScrollTo(null)}
            />
          )}
          <SearchMirror index={index} onReveal={handleReveal} />
        </>
      ) : (
        <div className="icon-browser-loading">
          <LoadingIndicator aria-label="Loading icons" />
        </div>
      )}
    </div>
  );
}

// Window-virtualized icon grid: only the rows near the viewport are in the DOM. Rows are
// the virtualized unit; each holds `cols` cells, recomputed from the container width.
function IconGrid({
  index,
  paths,
  view,
  selected,
  pending,
  onSelect,
  scrollTo,
  onScrolled,
}: {
  index: IconIndex;
  paths: string[];
  view: number[] | null;
  selected: number | null;
  pending: boolean;
  onSelect: (i: number) => void;
  scrollTo: number | null;
  onScrolled: () => void;
}) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = React.useState({ cols: 0, rowHeight: 0, scrollMargin: 0 });

  // Column count + square-cell row height derive from the container width, matching the
  // CSS `repeat(auto-fill, minmax(CELL_MIN, 1fr))`. scrollMargin = grid's document offset.
  React.useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      const cols = Math.max(1, Math.floor((width + GAP) / (CELL_MIN + GAP)));
      const cellWidth = (width - (cols - 1) * GAP) / cols;
      setMetrics({
        cols,
        rowHeight: cellWidth + GAP,
        scrollMargin: el.getBoundingClientRect().top + window.scrollY,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const cols = metrics.cols || 1;
  const length = view ? view.length : index.length;
  const rowCount = Math.ceil(length / cols);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => metrics.rowHeight || CELL_MIN + GAP,
    overscan: 6,
    scrollMargin: metrics.scrollMargin,
  });

  React.useEffect(() => {
    virtualizer.measure();
  }, [metrics.rowHeight, virtualizer]);

  // Scroll to an icon requested by a browser-find reveal, once its row is measurable.
  React.useEffect(() => {
    if (scrollTo == null || !metrics.cols) return;
    const pos = view ? view.indexOf(scrollTo) : scrollTo;
    if (pos >= 0) virtualizer.scrollToIndex(Math.floor(pos / cols), { align: "center" });
    onScrolled();
  }, [scrollTo, metrics.cols, cols, view, virtualizer, onScrolled]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>(".icon-cell");
    if (cell?.dataset.index) onSelect(Number(cell.dataset.index));
  };

  return (
    <div
      ref={parentRef}
      className="icon-grid"
      data-pending={pending ? "" : undefined}
      style={{ height: virtualizer.getTotalSize() }}
      onClick={handleClick}
    >
      {virtualizer.getVirtualItems().map((row) => {
        const start = row.index * cols;
        const cells = [];
        for (let c = 0; c < cols && start + c < length; c++) {
          const fi = view ? view[start + c] : start + c;
          const [name] = index[fi];
          cells.push(
            <button
              key={fi}
              type="button"
              className={fi === selected ? "icon-cell is-selected" : "icon-cell"}
              data-index={fi}
              title={name}
              aria-label={name}
            >
              <svg viewBox={VIEWBOX} width="32" height="32" fill="currentColor" aria-hidden>
                <path d={paths[fi]} />
              </svg>
            </button>,
          );
        }
        return (
          <div
            key={row.key}
            className="icon-grid-row"
            style={{
              transform: `translateY(${row.start - metrics.scrollMargin}px)`,
              height: row.size,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {cells}
          </div>
        );
      })}
    </div>
  );
}

// A hidden mirror of every icon name that browser find can still reach — the grid itself
// is windowed, so off-screen icons aren't in the DOM. Each name is `hidden="until-found"`
// (React normalizes the `hidden` attribute to a boolean, so it's set imperatively); on
// `beforematch` the browser is about to reveal it, so we surface the real icon instead.
// Static — never re-renders with the query.
const SearchMirror = React.memo(function SearchMirror({
  index,
  onReveal,
}: {
  index: IconIndex;
  onReveal: (i: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onRevealRef = React.useRef(onReveal);
  onRevealRef.current = onReveal;

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;
    for (const span of root.children) span.setAttribute("hidden", "until-found");
    const handle = (event: Event) => {
      const el = (event.target as HTMLElement)?.closest?.<HTMLElement>("[data-index]");
      if (el?.dataset.index) onRevealRef.current(Number(el.dataset.index));
    };
    // `beforematch` bubbles to the container.
    root.addEventListener("beforematch", handle);
    return () => root.removeEventListener("beforematch", handle);
  }, []);

  return (
    <div className="icon-search-mirror" ref={ref} aria-hidden>
      {index.map(([name], i) => (
        <span key={name} data-index={i}>
          {name}
        </span>
      ))}
    </div>
  );
});

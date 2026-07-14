"use client";

import "./SearchDialog.css";

import * as React from "react";
import Link from "next/link";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type MiniSearch from "minisearch";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";
import SearchIcon from "@brijbyte/md3-icons/outlined/Search";
import SubItemIcon from "@brijbyte/md3-icons/outlined/SubdirectoryArrowRight";
import { Dialog, DialogContent, DialogTrigger } from "@/ui/dialog";
import { IconButton } from "@/ui/icon-button";
import { List, ListItem } from "@/ui/list";
import { TextField } from "@/ui/text-field";
import { Typography } from "@/ui/typography";
import { NAV, SECTIONS, SHOWCASES, type NavItem } from "@/nav";
import { Button } from "@/ui/button";
import { useIsHydrated } from "@/utils/useIsHydrated";

type IndexPage = { route: string; sections: { id: string; heading: string; text: string }[] };

// One doc per page (title + description) plus one per h2/h3 section (heading +
// text). Section docs don't index the page title, so a title query surfaces
// the page once instead of every one of its sections.
type SearchDoc = {
  id: string;
  route: string;
  anchor?: string;
  page: string;
  title?: string;
  description?: string;
  heading?: string;
  text?: string;
};

type SearchHit = Omit<SearchDoc, "title"> & { id: string };

const NAV_BY_ROUTE = new Map(NAV.map((item) => [item.path, item]));

// Shared handle: connects the detached triggers to whichever SearchDialog is
// mounted, and lets the ⌘K shortcut open it imperatively.
const searchDialog = BaseDialog.createHandle();

// Engine loads once per session: minisearch and the index JSON are both
// fetched lazily on first open, never in the page bundle.
let enginePromise: Promise<MiniSearch<SearchDoc>> | null = null;
function loadEngine() {
  enginePromise ??= (async () => {
    const [{ default: MiniSearchCtor }, pages] = await Promise.all([
      import("minisearch"),
      // Inlined from next.config.ts: plain name in dev, content-hashed in prod.
      fetch(process.env.NEXT_PUBLIC_SEARCH_INDEX_URL ?? "/search-index.json").then(
        (res) => res.json() as Promise<IndexPage[]>,
      ),
    ]);
    const docs: SearchDoc[] = NAV.map((item) => ({
      id: item.path,
      route: item.path,
      page: item.title,
      title: item.title,
      description: item.description,
    }));
    for (const { route, sections } of pages) {
      const page = NAV_BY_ROUTE.get(route)?.title ?? route;
      for (const section of sections) {
        docs.push({
          id: `${route}#${section.id}`,
          route,
          anchor: section.id || undefined,
          page,
          heading: section.heading || undefined,
          text: section.text || undefined,
        });
      }
    }
    const mini = new MiniSearchCtor<SearchDoc>({
      fields: ["title", "description", "heading", "text"],
      storeFields: ["route", "anchor", "page", "description", "heading", "text"],
      searchOptions: {
        boost: { title: 5, heading: 3, description: 2 },
        prefix: true,
        fuzzy: 0.15,
      },
    });
    mini.addAll(docs);
    return mini;
  })();
  return enginePromise;
}

const hitHref = (hit: SearchHit) => (hit.anchor ? `${hit.route}#${hit.anchor}` : hit.route);

// A rendered result row; hits and browse-mode nav items share this shape.
type Row = {
  key: string;
  href: string;
  route: string;
  title: string;
  supporting?: string;
  icon?: NavItem["icon"];
  nested?: boolean; // a heading sub-result, indented under its page label
};

// `parent` is a clickable page row rendered above its nested heading rows;
// `label` is a non-interactive page/section header. A group has at most one.
type RowGroup = { key?: string; label?: string; parent?: Row; rows: Row[] };

const navRow = (item: NavItem): Row => ({
  key: item.path,
  href: item.path,
  route: item.path,
  title: item.label,
  supporting: item.description,
  icon: item.icon,
});

// Browse mode (empty query): the sidebar nav's sections plus the showcases,
// which have no sidebar entry.
const BROWSE_GROUPS: RowGroup[] = [
  ...SECTIONS.map((section) => ({ label: section.label, rows: section.items.map(navRow) })),
  { label: "Showcase", rows: SHOWCASES.map(navRow) },
];

// Title/description match → one clickable row for the page (links to its top).
const pageRow = (hit: SearchHit): Row => ({
  key: hit.id,
  href: hit.route,
  route: hit.route,
  title: hit.page,
  supporting: hit.description,
  icon: NAV_BY_ROUTE.get(hit.route)?.icon,
});

// Heading match → an indented sub-result under its page's label (links to #anchor).
const headingRow = (hit: SearchHit): Row => ({
  key: hit.id,
  href: hitHref(hit),
  route: hit.route,
  title: hit.heading!,
  supporting: hit.text || undefined,
  nested: true,
});

// How directly a page title answers the query (lower = better): exact, prefix,
// substring, none. Lifts the page the user is likely after (title "Buttons" for
// "button") above pages that merely contain the term ("Radio button").
const titleRank = (query: string, title: string): number => {
  const q = query.trim().toLowerCase();
  const t = title.toLowerCase();
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  if (t.includes(q)) return 2;
  return 3;
};

// Group hits by page. When the page title itself matched, it heads the group as a
// clickable parent row (links to page top) with any heading matches nested below;
// otherwise the page name is a non-interactive label above its heading matches.
// Groups are ordered by title affinity, falling back to the engine's ranking.
const groupHits = (hits: SearchHit[], query: string): RowGroup[] => {
  const order: string[] = [];
  const byRoute = new Map<string, { page: string; headings: SearchHit[]; pageHit?: SearchHit }>();
  for (const hit of hits) {
    let acc = byRoute.get(hit.route);
    if (!acc) {
      acc = { page: hit.page, headings: [] };
      byRoute.set(hit.route, acc);
      order.push(hit.route);
    }
    if (hit.heading) acc.headings.push(hit);
    else acc.pageHit ??= hit;
  }
  // Stable sort keeps the engine's order within an equal title rank.
  order.sort(
    (a, b) => titleRank(query, byRoute.get(a)!.page) - titleRank(query, byRoute.get(b)!.page),
  );
  return order.map((route) => {
    const acc = byRoute.get(route)!;
    const rows = acc.headings.map(headingRow);
    return acc.pageHit
      ? { key: route, parent: pageRow(acc.pageHit), rows }
      : { key: route, label: acc.page, rows };
  });
};

export function SearchDialog() {
  // The handle drives open/close; this mirror only gates lazy-loading the engine.
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [engine, setEngine] = React.useState<MiniSearch<SearchDoc> | null>(null);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchDialog.open(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (open) loadEngine().then(setEngine);
  }, [open]);

  const groups = React.useMemo<RowGroup[]>(() => {
    if (!query.trim()) return BROWSE_GROUPS;
    if (!engine) return [];
    const hits = engine.search(query).slice(0, 10) as unknown as SearchHit[];
    return groupHits(hits, query);
  }, [engine, query]);
  const rows = groups.flatMap((group) =>
    group.parent ? [group.parent, ...group.rows] : group.rows,
  );

  const renderRow = (row: Row) => (
    <Autocomplete.Item
      key={row.key}
      value={row}
      render={
        <ListItem
          as={Link}
          href={row.href}
          className={row.nested ? "docs-search-child" : undefined}
          tabIndex={-1}
          onClick={() => searchDialog.close()}
          leading={row.nested ? <SubItemIcon /> : row.icon ? <row.icon /> : <SearchIcon />}
          supportingText={
            row.supporting ? (
              <span className="docs-search-snippet">{row.supporting}</span>
            ) : undefined
          }
        />
      }
    >
      {row.title}
    </Autocomplete.Item>
  );

  return (
    <Dialog handle={searchDialog} onOpenChange={setOpen}>
      <DialogContent className="docs-search-dialog" aria-label="Search documentation">
        <Autocomplete.Root
          filter={null}
          open
          onOpenChange={(next) => {
            if (!next) searchDialog.close();
          }}
          value={query}
          onValueChange={setQuery}
          itemToStringValue={(row: Row) => row.title}
          autoHighlight
        >
          <Autocomplete.Input
            render={
              <TextField
                variant="filled"
                className="docs-search-field"
                leadingIcon={<SearchIcon />}
                trailingIcon={
                  query ? (
                    <Autocomplete.Clear
                      render={<IconButton aria-label="Clear search" />}
                      onClick={() => setQuery("")}
                    >
                      <CloseIcon />
                    </Autocomplete.Clear>
                  ) : undefined
                }
                placeholder="Search the docs"
                aria-label="Search the docs"
                autoFocus
              />
            }
          />
          {rows.length > 0 ? (
            <Autocomplete.List
              render={<List className="docs-search-results" />}
              aria-label="Search results"
            >
              {groups.map((group) =>
                group.parent ? (
                  <React.Fragment key={group.key}>
                    {renderRow(group.parent)}
                    {group.rows.map(renderRow)}
                  </React.Fragment>
                ) : group.label ? (
                  <Autocomplete.Group
                    key={group.key ?? group.label}
                    items={group.rows}
                    className="docs-search-group"
                    render={<li />}
                  >
                    <Autocomplete.GroupLabel
                      render={
                        <Typography
                          as="div"
                          variant="title-small"
                          className="px-4 pt-4 pb-1 font-brand text-on-surface-variant"
                        />
                      }
                    >
                      {group.label}
                    </Autocomplete.GroupLabel>
                    <ul role="none" className="docs-search-group-list">
                      {group.rows.map(renderRow)}
                    </ul>
                  </Autocomplete.Group>
                ) : (
                  <React.Fragment key={group.key ?? "results"}>
                    {group.rows.map(renderRow)}
                  </React.Fragment>
                ),
              )}
            </Autocomplete.List>
          ) : (
            <Typography variant="body-medium" className="docs-search-empty text-on-surface-variant">
              {engine ? `No results for “${query.trim()}”` : "Loading search index…"}
            </Typography>
          )}
        </Autocomplete.Root>
      </DialogContent>
    </Dialog>
  );
}

function useIsMac() {
  const isHydrated = useIsHydrated();
  if (!isHydrated) return "  ";
  return /Mac|iP/.test(navigator.platform);
}

function useShortcutHint() {
  const isMac = useIsMac();
  return isMac ? "⌘K" : "Ctrl+K";
}

export function SearchButton() {
  const keys = useShortcutHint();
  return (
    <DialogTrigger
      handle={searchDialog}
      className="mx-1 flex h-12 shrink-0 items-center gap-3 rounded-full bg-surface-container-high px-4 text-on-surface-variant hover:bg-surface-container-highest"
    >
      <SearchIcon className="text-2xl" />
      <Typography as="span" variant="body-large" className="flex-1 text-start">
        Search
      </Typography>
      {keys && (
        <Typography as="kbd" variant="label-medium" className="font-plain">
          {keys}
        </Typography>
      )}
    </DialogTrigger>
  );
}

export function SearchIconButton() {
  const keys = useShortcutHint();
  return (
    <DialogTrigger
      handle={searchDialog}
      aria-label={`Search the docs. Press ${keys}`}
      render={<Button variant="outlined" />}
    >
      <Typography as="span" variant="body-small">
        {keys}
      </Typography>
    </DialogTrigger>
  );
}

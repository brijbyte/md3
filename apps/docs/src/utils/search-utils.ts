import type MiniSearch from "minisearch";
import { NAV, SECTIONS, SHOWCASES, type NavItem } from "@/nav";

type IndexPage = { route: string; sections: { id: string; heading: string; text: string }[] };

// One doc per page (title + description) plus one per h2/h3 section (heading +
// text). Section docs don't index the page title, so a title query surfaces
// the page once instead of every one of its sections.
export type SearchDoc = {
  id: string;
  route: string;
  anchor?: string;
  page: string;
  title?: string;
  description?: string;
  heading?: string;
  text?: string;
};

export type SearchHit = Omit<SearchDoc, "title">;

const NAV_BY_ROUTE = new Map(NAV.map((item) => [item.path, item]));

// Engine loads once per session: minisearch and the index JSON are both
// fetched lazily on first open, never in the page bundle.
let enginePromise: Promise<MiniSearch<SearchDoc>> | null = null;
export function loadEngine() {
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

// A rendered result row; hits and browse-mode nav items share this shape.
export type Row = {
  key: string;
  href: string;
  route: string;
  title: string;
  supporting?: string;
  icon?: NavItem["icon"];
  nested?: boolean; // a heading sub-result, indented under its page label
};

// `parent` is a clickable page row rendered above its nested heading rows;
// `label` is a non-interactive page/section header.
export type RowGroup =
  | { key: string; parent: Row; label?: undefined; rows: Row[] }
  | { key: string; label: string; parent?: undefined; rows: Row[] };

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
export const BROWSE_GROUPS: RowGroup[] = [
  ...SECTIONS.map((section) => ({
    key: section.label,
    label: section.label,
    rows: section.items.map(navRow),
  })),
  { key: "Showcase", label: "Showcase", rows: SHOWCASES.map(navRow) },
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
  href: hit.anchor ? `${hit.route}#${hit.anchor}` : hit.route,
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
export const groupHits = (hits: SearchHit[], query: string): RowGroup[] => {
  const byRoute = new Map<string, { page: string; headings: SearchHit[]; pageHit?: SearchHit }>();
  for (const hit of hits) {
    let acc = byRoute.get(hit.route);
    if (!acc) {
      acc = { page: hit.page, headings: [] };
      byRoute.set(hit.route, acc);
    }
    if (hit.heading) acc.headings.push(hit);
    else acc.pageHit ??= hit;
  }
  // Stable sort keeps the engine's order within an equal title rank.
  return [...byRoute.entries()]
    .toSorted(([, a], [, b]) => titleRank(query, a.page) - titleRank(query, b.page))
    .map(([route, acc]) => {
      const rows = acc.headings.map(headingRow);
      return acc.pageHit
        ? { key: route, parent: pageRow(acc.pageHit), rows }
        : { key: route, label: acc.page, rows };
    });
};

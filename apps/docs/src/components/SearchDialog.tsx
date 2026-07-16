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
import { Button } from "@/ui/button";
import {
  BROWSE_GROUPS,
  groupHits,
  loadEngine,
  type Row,
  type RowGroup,
  type SearchDoc,
  type SearchHit,
} from "@/utils/search-utils";
import { useIsHydrated } from "@/utils/useIsHydrated";

// Shared handle: connects the detached triggers to whichever SearchDialog is
// mounted, and lets the ⌘K shortcut open it imperatively.
const searchDialog = BaseDialog.createHandle();

// Tracks the visible viewport height (shrinks when the software keyboard is
// up) so the compact full-screen dialog can size itself to the remaining area.
function useVisualViewportVar() {
  React.useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () =>
      document.documentElement.style.setProperty("--docs-search-vvh", `${viewport.height}px`);
    update();
    viewport.addEventListener("resize", update);
    return () => {
      viewport.removeEventListener("resize", update);
      document.documentElement.style.removeProperty("--docs-search-vvh");
    };
  }, []);
}

function VisualViewportVar() {
  useVisualViewportVar();
  return null;
}

export function SearchDialog() {
  const [query, setQuery] = React.useState("");
  const [engine, setEngine] = React.useState<MiniSearch<SearchDoc> | null>(null);
  const savedScroll = React.useRef<{ x: number; y: number } | null>(null);

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

  const groups = React.useMemo<RowGroup[]>(() => {
    if (!query.trim()) return BROWSE_GROUPS;
    if (!engine) return [];
    const hits = engine.search(query).slice(0, 10) as unknown as SearchHit[];
    return groupHits(hits, query);
  }, [engine, query]);
  // Flat items in DOM order: keeps Base UI's item registry in sync with our
  // external filtering, so the highlight resets to the first row per query.
  const rows = React.useMemo(
    () => groups.flatMap((group) => (group.parent ? [group.parent, ...group.rows] : group.rows)),
    [groups],
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Mobile browsers pan the page when the software keyboard opens for the
      // autofocused input and leave it panned after close; the page is
      // scroll-locked while open, so any offset delta is that pan — undo it.
      const saved = savedScroll.current;
      if (saved) requestAnimationFrame(() => window.scrollTo(saved.x, saved.y));
      return;
    }
    savedScroll.current = { x: window.scrollX, y: window.scrollY };
    setQuery("");
    React.startTransition(() => {
      loadEngine().then(setEngine);
    });
  };

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
    <Dialog handle={searchDialog} onOpenChange={handleOpenChange}>
      <DialogContent className="docs-search-dialog" aria-label="Search documentation">
        {/* Mounts only while the dialog is open. */}
        <VisualViewportVar />
        <Autocomplete.Root
          items={rows}
          filter={null}
          open
          // The popup also "closes" when the query empties (backspace/clear);
          // only Escape should dismiss the dialog.
          onOpenChange={(next, eventDetails) => {
            if (!next && eventDetails.reason === "escape-key") searchDialog.close();
          }}
          value={query}
          onValueChange={setQuery}
          itemToStringValue={(row: Row) => row.title}
          autoHighlight="always"
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
                  ) : (
                    // Compact-only (hidden by CSS on ≥600px): full-screen search
                    // view needs an explicit close — no scrim click, no Escape.
                    <IconButton
                      className="docs-search-close"
                      aria-label="Close search"
                      onClick={() => searchDialog.close()}
                    >
                      <CloseIcon />
                    </IconButton>
                  )
                }
                placeholder="Search the docs"
                aria-label="Search the docs"
                autoFocus
              />
            }
          />
          {groups.length > 0 ? (
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
                ) : (
                  <Autocomplete.Group
                    key={group.key}
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

function useShortcutHint() {
  const isHydrated = useIsHydrated();
  // SSR/first render assumes Mac so markup matches; corrected after hydration.
  const isMac = !isHydrated || /Mac|iP/.test(navigator.platform);
  return isMac ? "⌘K" : "Ctrl+K";
}

export function SearchButton({
  hideShortcut,
  className,
}: {
  hideShortcut?: boolean;
  className?: string;
}) {
  const keys = useShortcutHint();
  return (
    <DialogTrigger
      handle={searchDialog}
      aria-label={`Search the docs. Press ${keys}`}
      render={
        <Button icon={<SearchIcon />} variant="outlined" size="xsmall" className={className} />
      }
    >
      {!hideShortcut ? (
        <Typography as="span" variant="body-large">
          {keys}
        </Typography>
      ) : null}
    </DialogTrigger>
  );
}

export function SearchIconButton({ className }: { className?: string }) {
  return (
    <DialogTrigger
      handle={searchDialog}
      render={
        <IconButton
          size="xsmall"
          variant="tonal"
          aria-label="Search the docs"
          className={className}
        />
      }
    >
      <SearchIcon />
    </DialogTrigger>
  );
}

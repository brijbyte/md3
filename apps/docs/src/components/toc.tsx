import * as React from "react";
import { Typography } from "@brijbyte/md3-react/typography";

export type TocItem = { depth: number; text: string; id: string };

// Nest a flat heading outline by depth: items at the group's shallowest depth
// start entries, deeper items nest under the entry before them.
function TocList({ items }: { items: TocItem[] }) {
  const top = Math.min(...items.map((i) => i.depth));
  const groups: { item: TocItem; children: TocItem[] }[] = [];
  for (const item of items) {
    if (item.depth <= top || groups.length === 0) groups.push({ item, children: [] });
    else groups[groups.length - 1].children.push(item);
  }
  return (
    <ul className="flex flex-col">
      {groups.map(({ item, children }) => (
        <li key={item.id}>
          <Typography
            as="a"
            variant="body-medium"
            href={`#${item.id}`}
            className="block py-1.5 text-on-surface-variant hover:text-on-surface"
          >
            {item.text}
          </Typography>
          {children.length > 0 && (
            <div className="border-l border-outline-variant pl-3">
              <TocList items={children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// Floating "On this page" outline (server component, plain anchor links).
export function Toc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="On this page">
      <Typography as="a" variant="title-small" className="block pb-2 text-on-surface" href="#top">
        On this page
      </Typography>
      <TocList items={items} />
    </nav>
  );
}

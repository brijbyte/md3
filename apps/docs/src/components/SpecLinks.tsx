import { AssistChip } from "@brijbyte/md3-react/chip";
import OpenInNewIcon from "@brijbyte/md3-icons/outlined/OpenInNew";

export type SpecLink = { label: string; href: string };

// Real <a> tags (via AssistChip's render prop) so the links are crawlable, not just
// styled buttons — same visual treatment as the Chips demo, used here for SEO.
export function SpecLinks({ links }: { links: SpecLink[] }) {
  return (
    <nav aria-label="Reference links" className="my-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <AssistChip
          key={link.href}
          icon={<OpenInNewIcon />}
          render={<a href={link.href} target="_blank" rel="noopener noreferrer" />}
        >
          {link.label}
        </AssistChip>
      ))}
    </nav>
  );
}

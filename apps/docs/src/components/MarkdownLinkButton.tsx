import { Button } from "@/ui/button";
import MarkdownIcon from "@brijbyte/md3-icons/outlined/Markdown";

// Links a page's LLM-facing markdown twin (llms.txt lists them all). Sized to
// sit beside a display-small page title.
export function MarkdownLinkButton({ path }: { path: string }) {
  return (
    <Button
      variant="outlined"
      size="xsmall"
      icon={<MarkdownIcon />}
      className="mt-3 shrink-0"
      render={<a href={`${path}.md`} />}
    >
      Markdown
    </Button>
  );
}

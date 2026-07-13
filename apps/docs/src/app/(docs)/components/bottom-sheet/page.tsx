import Content, { toc } from "@/content/bottom-sheet/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/bottom-sheet");

export default function Page() {
  return (
    <DocsPage path="/components/bottom-sheet" toc={toc}>
      <Content />
    </DocsPage>
  );
}

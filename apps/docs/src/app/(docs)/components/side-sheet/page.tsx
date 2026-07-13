import Content, { toc } from "@/content/side-sheet/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/side-sheet");

export default function Page() {
  return (
    <DocsPage path="/components/side-sheet" toc={toc}>
      <Content />
    </DocsPage>
  );
}

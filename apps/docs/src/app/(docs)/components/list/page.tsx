import Content, { toc } from "@/content/list/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/list");

export default function Page() {
  return (
    <DocsPage path="/components/list" toc={toc}>
      <Content />
    </DocsPage>
  );
}

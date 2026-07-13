import Content, { toc } from "@/content/tooltip/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/tooltip");

export default function Page() {
  return (
    <DocsPage path="/components/tooltip" toc={toc}>
      <Content />
    </DocsPage>
  );
}

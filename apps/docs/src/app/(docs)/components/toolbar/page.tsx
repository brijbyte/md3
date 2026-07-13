import Content, { toc } from "@/content/toolbar/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/toolbar");

export default function Page() {
  return (
    <DocsPage path="/components/toolbar" toc={toc}>
      <Content />
    </DocsPage>
  );
}

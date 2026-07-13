import Content, { toc } from "@/content/fab-menu/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/fab-menu");

export default function Page() {
  return (
    <DocsPage path="/components/fab-menu" toc={toc}>
      <Content />
    </DocsPage>
  );
}

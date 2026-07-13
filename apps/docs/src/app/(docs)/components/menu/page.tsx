import Content, { toc } from "@/content/menu/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/menu");

export default function Page() {
  return (
    <DocsPage path="/components/menu" toc={toc}>
      <Content />
    </DocsPage>
  );
}

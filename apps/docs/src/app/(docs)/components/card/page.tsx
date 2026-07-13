import Content, { toc } from "@/content/card/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/card");

export default function Page() {
  return (
    <DocsPage path="/components/card" toc={toc}>
      <Content />
    </DocsPage>
  );
}

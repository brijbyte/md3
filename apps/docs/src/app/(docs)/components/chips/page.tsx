import Content, { toc } from "@/content/chips/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/chips");

export default function Page() {
  return (
    <DocsPage path="/components/chips" toc={toc}>
      <Content />
    </DocsPage>
  );
}

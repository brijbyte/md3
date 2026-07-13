import Content, { toc } from "@/content/checkbox/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/checkbox");

export default function Page() {
  return (
    <DocsPage path="/components/checkbox" toc={toc}>
      <Content />
    </DocsPage>
  );
}

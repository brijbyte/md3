import Content, { toc } from "@/content/dialog/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/dialog");

export default function Page() {
  return (
    <DocsPage path="/components/dialog" toc={toc}>
      <Content />
    </DocsPage>
  );
}

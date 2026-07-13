import Content, { toc } from "@/content/tabs/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/tabs");

export default function Page() {
  return (
    <DocsPage path="/components/tabs" toc={toc}>
      <Content />
    </DocsPage>
  );
}

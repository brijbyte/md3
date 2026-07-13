import Content, { toc } from "@/content/switch/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/switch");

export default function Page() {
  return (
    <DocsPage path="/components/switch" toc={toc}>
      <Content />
    </DocsPage>
  );
}

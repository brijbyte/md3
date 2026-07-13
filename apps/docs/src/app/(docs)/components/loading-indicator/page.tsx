import Content, { toc } from "@/content/loading-indicator/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/loading-indicator");

export default function Page() {
  return (
    <DocsPage path="/components/loading-indicator" toc={toc}>
      <Content />
    </DocsPage>
  );
}

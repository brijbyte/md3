import Content, { toc } from "@/content/integration/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/overview/integration");

export default function Page() {
  return (
    <DocsPage path="/overview/integration" toc={toc}>
      <Content />
    </DocsPage>
  );
}

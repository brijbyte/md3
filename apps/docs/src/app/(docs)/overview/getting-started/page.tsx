import Content, { toc } from "@/content/getting-started/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/overview/getting-started");

export default function Page() {
  return (
    <DocsPage path="/overview/getting-started" toc={toc}>
      <Content />
    </DocsPage>
  );
}

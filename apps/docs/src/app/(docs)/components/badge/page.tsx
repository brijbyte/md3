import Content, { toc } from "@/content/badge/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/badge");

export default function Page() {
  return (
    <DocsPage path="/components/badge" toc={toc}>
      <Content />
    </DocsPage>
  );
}

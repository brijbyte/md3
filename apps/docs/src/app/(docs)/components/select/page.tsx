import Content, { toc } from "@/content/select/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/select");

export default function Page() {
  return (
    <DocsPage path="/components/select" toc={toc}>
      <Content />
    </DocsPage>
  );
}

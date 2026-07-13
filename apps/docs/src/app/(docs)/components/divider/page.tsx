import Content, { toc } from "@/content/divider/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/divider");

export default function Page() {
  return (
    <DocsPage path="/components/divider" toc={toc}>
      <Content />
    </DocsPage>
  );
}

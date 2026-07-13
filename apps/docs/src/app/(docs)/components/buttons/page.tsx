import Content, { toc } from "@/content/buttons/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/buttons");

export default function Page() {
  return (
    <DocsPage path="/components/buttons" toc={toc}>
      <Content />
    </DocsPage>
  );
}

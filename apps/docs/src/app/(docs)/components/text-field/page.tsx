import Content, { toc } from "@/content/text-field/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/text-field");

export default function Page() {
  return (
    <DocsPage path="/components/text-field" toc={toc}>
      <Content />
    </DocsPage>
  );
}

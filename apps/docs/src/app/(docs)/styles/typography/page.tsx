import Content, { toc } from "@/content/typography/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/styles/typography");

export default function Page() {
  return (
    <DocsPage path="/styles/typography" toc={toc}>
      <Content />
    </DocsPage>
  );
}

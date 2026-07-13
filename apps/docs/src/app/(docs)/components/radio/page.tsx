import Content, { toc } from "@/content/radio/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/radio");

export default function Page() {
  return (
    <DocsPage path="/components/radio" toc={toc}>
      <Content />
    </DocsPage>
  );
}

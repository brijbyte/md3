import Content, { toc } from "@/content/slider/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/slider");

export default function Page() {
  return (
    <DocsPage path="/components/slider" toc={toc}>
      <Content />
    </DocsPage>
  );
}

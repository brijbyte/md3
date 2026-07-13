import Content, { toc } from "@/content/icons/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/styles/icons");

export default function Page() {
  return (
    <DocsPage path="/styles/icons" toc={toc}>
      <Content />
    </DocsPage>
  );
}

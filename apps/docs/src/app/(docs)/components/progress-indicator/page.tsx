import Content, { toc } from "@/content/progress-indicator/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/progress-indicator");

export default function Page() {
  return (
    <DocsPage path="/components/progress-indicator" toc={toc}>
      <Content />
    </DocsPage>
  );
}

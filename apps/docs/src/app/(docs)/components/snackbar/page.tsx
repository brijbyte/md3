import Content, { toc } from "@/content/snackbar/page.mdx";
import { DocsPage } from "@/components/DocsPage";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/components/snackbar");

export default function Page() {
  return (
    <DocsPage path="/components/snackbar" toc={toc}>
      <Content />
    </DocsPage>
  );
}

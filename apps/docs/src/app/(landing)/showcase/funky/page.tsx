import ShowcaseFunky from "@/content/showcases/funky";
import { routeMetadata } from "@/nav";

export const metadata = routeMetadata("/showcase/funky");

export default function Page() {
  return <ShowcaseFunky />;
}

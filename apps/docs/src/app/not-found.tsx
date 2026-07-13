import Link from "next/link";
import { Typography } from "@/ui/typography";
import { SidebarNav } from "../components/SidebarNav";
import { ThemeToggle } from "../components/ThemeToggle";

// 404 in the docs chrome (sidebar + header), mirroring the old Root fallback.
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 hidden h-screen w-70 shrink-0 flex-col p-3 md:flex">
        <Typography as={Link} variant="title-large" href="/" className="shrink-0 px-4 pt-4 pb-2">
          MD3 React
        </Typography>
        <SidebarNav />
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-190 px-6 pt-6 pb-24">
          <header className="flex items-center justify-between gap-4 pb-4">
            <Typography as={Link} variant="title-large" href="/" className="md:hidden">
              MD3 React
            </Typography>
            <span className="hidden md:block" aria-hidden />
            <ThemeToggle />
          </header>
          <Typography as="h1" variant="display-small" className="font-bold">
            Page not found
          </Typography>
          <Typography className="mt-2 text-on-surface-variant">
            Nothing lives at this address.{" "}
            <Link href="/" className="text-primary underline">
              Back to the overview
            </Link>
            .
          </Typography>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@brijbyte/md3-react/button";
import { Typography } from "@brijbyte/md3-react/typography";
import ArrowForwardIcon from "@brijbyte/md3-icons/outlined/ArrowForward";
import { NAV } from "../nav";

export default function HomePage() {
  return (
    <>
      <section className="max-w-prose">
        <Typography as="h1" variant="display-small">
          Material Design 3 <span className="text-primary">for React</span>
        </Typography>
        <Typography className="mt-4 text-on-surface-variant">
          A React implementation of Google’s Material Design 3, built as a styled layer on top of
          the headless Base UI primitives. Pick a component to see every variant and state.
        </Typography>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button
            render={<a href="/overview/getting-started" />}
            nativeButton={false}
            icon={<ArrowForwardIcon />}
          >
            Get started
          </Button>
        </div>
      </section>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NAV.filter((item) => item.path !== "/").map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="group flex flex-col gap-3 rounded-extra-large bg-surface-container-low p-6 transition-colors hover:bg-surface-container"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary-container text-2xl text-on-secondary-container">
              <item.icon />
            </span>
            <Typography as="span" variant="title-medium">
              {item.label}
            </Typography>
            <Typography as="span" variant="body-medium" className="text-on-surface-variant">
              {item.description}
            </Typography>
          </a>
        ))}
      </div>
    </>
  );
}

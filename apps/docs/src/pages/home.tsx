import { ActionableCard } from "@brijbyte/md3-react/card";
import { Button } from "@brijbyte/md3-react/button";
import { Typography } from "@brijbyte/md3-react/typography";
import ArrowForwardIcon from "@brijbyte/md3-icons/outlined/ArrowForward";
import { NAV } from "../nav";

export default function HomePage() {
  return (
    <>
      <section className="max-w-prose">
        <Typography as="h1" variant="display-large" className="font-bold">
          Material Design 3,
          <br />
          <span className="text-primary">built right for React</span>
        </Typography>
        <Typography variant="title-large" className="mt-6 text-on-surface-variant">
          Every component matches Google's own Compose Material3 implementation — spacing, motion,
          and all. Accessibility and keyboard handling come from Base UI, so you get it right for
          free.
        </Typography>
        <div className="mt-8 flex flex-wrap items-center gap-4">
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
          <ActionableCard
            key={item.path}
            render={<a href={item.path} />}
            nativeButton={false}
            className="flex flex-col gap-3 p-6"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary-container text-2xl text-on-secondary-container">
              <item.icon />
            </span>
            <Typography as="span" variant="title-large" className="font-bold">
              {item.label}
            </Typography>
            <Typography as="span" variant="body-medium" className="text-on-surface-variant">
              {item.description}
            </Typography>
          </ActionableCard>
        ))}
      </div>
    </>
  );
}

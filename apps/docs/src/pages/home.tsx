import { NAV } from "../nav";

export default function HomePage() {
  return (
    <>
      <p className="max-w-prose text-body-large">
        A React implementation of Google’s Material Design 3, built as a styled layer on top of the
        headless Base UI primitives. Pick a component to see every variant and state.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NAV.filter((item) => item.path !== "/").map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="group flex flex-col gap-3 rounded-extra-large bg-surface-container-low p-6 transition-colors hover:bg-surface-container"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary-container text-2xl text-on-secondary-container">
              <item.icon />
            </span>
            <span className="font-brand text-title-medium">{item.label}</span>
            <span className="text-body-medium text-on-surface-variant">{item.description}</span>
          </a>
        ))}
      </div>
    </>
  );
}

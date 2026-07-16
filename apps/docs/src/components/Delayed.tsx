"use client";

import * as React from "react";

// Renders its children only after `delay` ms. Used to wrap a loading indicator
// (a Suspense fallback or a state-driven one): if the content becomes ready
// before the delay elapses, this unmounts and the spinner never flashes. As a
// Suspense fallback the boundary mounts it while suspended and unmounts it on
// resolve, so the timer is cleared automatically on a fast load.
export function Delayed({ delay = 300, children }: { delay?: number; children: React.ReactNode }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const id = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return show ? <>{children}</> : null;
}

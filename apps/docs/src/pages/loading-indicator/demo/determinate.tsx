"use client";
import "./determinate.css";

import * as React from "react";
import { LoadingIndicator } from "@brijbyte/md3-react/loading-indicator";

export default function LoadingIndicatorDeterminateDemo() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : Math.min(1, p + 0.02)));
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="demo-loading-indicator-determinate">
      <LoadingIndicator aria-label="Loading" progress={progress} />
      <LoadingIndicator aria-label="Loading" progress={progress} contained />
    </div>
  );
}

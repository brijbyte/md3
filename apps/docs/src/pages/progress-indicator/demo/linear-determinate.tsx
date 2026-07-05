"use client";
import "./linear-determinate.css";

import * as React from "react";
import { LinearProgress } from "@brijbyte/md3-react/linear-progress";

export default function LinearProgressDeterminateDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 2));
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="demo-progress-indicator-linear">
      <LinearProgress value={value} aria-label="Downloading" />
      <LinearProgress value={value} aria-label="Downloading" wavy />
    </div>
  );
}

"use client";
import "./circular-determinate.css";

import * as React from "react";
import { CircularProgress } from "@brijbyte/md3-react/circular-progress";

export default function CircularProgressDeterminateDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 2));
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="demo-progress-indicator-circular">
      <CircularProgress value={value} aria-label="Downloading" />
    </div>
  );
}

"use client";
import "@brijbyte/md3-react/button.css";
import "./motion.css";

import * as React from "react";
import { Button } from "@brijbyte/md3-react/button";

// A representative slice of the duration scale (short → long), all on the
// emphasized curve so only the time-to-travel differs between tracks.
const DURATIONS = [
  { token: "short2", ms: 100 },
  { token: "short4", ms: 200 },
  { token: "medium2", ms: 300 },
  { token: "medium4", ms: 400 },
  { token: "long2", ms: 500 },
  { token: "long4", ms: 600 },
];

export default function DurationsDemo() {
  const [playing, setPlaying] = React.useState(true);
  return (
    <div className="demo-motion" data-playing={playing}>
      <div className="demo-motion-toolbar">
        <Button variant="filled" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </Button>
      </div>
      <div className="demo-motion-tracks">
        {DURATIONS.map((d) => (
          <div key={d.token} className="demo-motion-track">
            <span className="demo-motion-label">
              {d.token} · {d.ms}ms
            </span>
            <div className="demo-motion-rail">
              <span className="demo-motion-dot" data-duration={d.token} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

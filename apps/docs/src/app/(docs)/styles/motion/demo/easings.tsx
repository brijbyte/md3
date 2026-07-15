"use client";
import "@brijbyte/md3-react/button.css";
import "./motion.css";

import * as React from "react";
import { Button } from "@brijbyte/md3-react/button";

// The full MD3 easing set. Emphasized is the default for most transitions;
// its accelerate/decelerate variants shape one-directional enter/exit motion.
const EASINGS = [
  { token: "emphasized", label: "Emphasized" },
  { token: "emphasized-decelerate", label: "Emphasized decelerate" },
  { token: "emphasized-accelerate", label: "Emphasized accelerate" },
  { token: "standard", label: "Standard" },
  { token: "standard-decelerate", label: "Standard decelerate" },
  { token: "standard-accelerate", label: "Standard accelerate" },
  { token: "fast-spatial", label: "Fast spatial" },
];

export default function EasingsDemo() {
  const [playing, setPlaying] = React.useState(true);
  return (
    <div className="demo-motion" data-playing={playing}>
      <div className="demo-motion-toolbar">
        <Button variant="filled" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </Button>
      </div>
      <div className="demo-motion-tracks">
        {EASINGS.map((e) => (
          <div key={e.token} className="demo-motion-track">
            <span className="demo-motion-label">{e.label}</span>
            <div className="demo-motion-rail">
              <span className="demo-motion-dot" data-ease={e.token} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  // Bumping the key remounts the dots, restarting their CSS animation.
  const [run, setRun] = React.useState(0);
  return (
    <div className="demo-motion">
      <div className="demo-motion-toolbar">
        <Button variant="filled" onClick={() => setRun((r) => r + 1)}>
          Play
        </Button>
      </div>
      <div className="demo-motion-tracks">
        {EASINGS.map((e) => (
          <div key={e.token} className="demo-motion-track">
            <span className="demo-motion-label">{e.label}</span>
            <div className="demo-motion-rail">
              <span key={run} className="demo-motion-dot" data-ease={e.token} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

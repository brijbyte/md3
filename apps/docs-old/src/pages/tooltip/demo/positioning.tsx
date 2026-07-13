"use client";
import "./positioning.css";

import * as React from "react";
import { Button } from "@brijbyte/md3-react/button";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { RichTooltip, RichTooltipContent, RichTooltipTrigger } from "@brijbyte/md3-react/tooltip";
import BrushIcon from "@brijbyte/md3-icons/outlined/Brush";

const CORNERS = [
  { key: "top-left", align: "start" as const },
  { key: "top-right", align: "end" as const },
  { key: "bottom-left", align: "start" as const },
  { key: "bottom-right", align: "end" as const },
];

function PositioningFrame({ corner, align }: { corner: string; align: "start" | "end" }) {
  // Pin the collision boundary to this frame (rather than the default
  // clipping-ancestors detection) so the tooltip stays inside it.
  const [frame, setFrame] = React.useState<HTMLDivElement | null>(null);

  return (
    <div className="demo-tooltip-positioning-frame" ref={setFrame}>
      <RichTooltip>
        <RichTooltipTrigger
          render={
            <IconButton
              aria-label="Paint tool"
              className={`demo-tooltip-positioning-anchor demo-tooltip-positioning-anchor--${corner}`}
            />
          }
        >
          <BrushIcon />
        </RichTooltipTrigger>
        <RichTooltipContent
          title="Paint Tool"
          align={align}
          action={<Button variant="text">Learn more</Button>}
          positionerProps={frame ? { collisionBoundary: frame } : undefined}
        >
          Add annotations and highlights with the paint tool.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  );
}

export default function PositioningTooltipDemo() {
  return (
    <div className="demo-tooltip-positioning">
      {CORNERS.map((corner) => (
        <PositioningFrame key={corner.key} corner={corner.key} align={corner.align} />
      ))}
    </div>
  );
}

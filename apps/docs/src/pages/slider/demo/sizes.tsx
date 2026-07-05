"use client";

import "./sizes.css";

import * as React from "react";
import { Slider } from "@brijbyte/md3-react/slider";
import VolumeUp from "@brijbyte/md3-icons/outlined/VolumeUp";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Typography } from "@brijbyte/md3-react/typography";

export default function SliderSizesDemo() {
  const [orientation, setOrientation] = React.useState<"horizontal" | "vertical">("horizontal");

  return (
    <>
      <div className="demo-slider-sizes-controls">
        <Typography as="label" variant="label-medium" className="demo-slider-sizes-label">
          <Checkbox
            checked={orientation === "horizontal"}
            onCheckedChange={(v) => setOrientation(v ? "horizontal" : "vertical")}
          />

          {orientation === "horizontal" ? "Horizontal" : "Vertical"}
        </Typography>
      </div>
      <div
        className={`demo-slider-sizes ${orientation === "vertical" ? "demo-slider-sizes-vertical" : ""}`}
      >
        <Slider orientation={orientation} aria-label="Extra small" size="xs" defaultValue={60} />
        <Slider orientation={orientation} aria-label="Small" size="s" defaultValue={60} />
        <Slider
          orientation={orientation}
          aria-label="Medium"
          size="m"
          defaultValue={60}
          icon={<VolumeUp />}
        />
        <Slider
          orientation={orientation}
          aria-label="Large"
          size="l"
          defaultValue={60}
          icon={<VolumeUp />}
        />
        <Slider
          orientation={orientation}
          aria-label="Extra large"
          size="xl"
          defaultValue={60}
          icon={<VolumeUp />}
        />
      </div>
    </>
  );
}

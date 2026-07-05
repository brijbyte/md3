"use client";

import "./smart-home.css";

import * as React from "react";
import { Slider } from "@brijbyte/md3-react/slider";
import Lightbulb from "@brijbyte/md3-icons/outlined/Lightbulb";
import { Typography } from "@brijbyte/md3-react/typography";

export default function SliderSmartHomeDemo() {
  const [value, setValue] = React.useState(80);

  return (
    <div className="demo-slider-smart-home">
      <Lightbulb className="demo-slider-smart-home-icon" />
      <Typography variant="title-large">Bedroom Lights</Typography>
      <div className="demo-slider-smart-home-control">
        <Slider
          aria-label="Brightness"
          orientation="vertical"
          size="xl"
          icon={<Lightbulb />}
          value={value}
          onValueChange={(newValue) => setValue(newValue as number)}
        />
      </div>
    </div>
  );
}

"use client";
import "./range.css";

import { Slider } from "@brijbyte/md3-react/slider";

export default function SliderRangeDemo() {
  return (
    <div className="demo-slider-range">
      <Slider
        getAriaLabel={(index) => (index === 0 ? "Minimum price" : "Maximum price")}
        defaultValue={[20, 80]}
      />
    </div>
  );
}

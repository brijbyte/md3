import "@brijbyte/md3-react/slider.css";
import "./sizes.css";

import { Slider } from "@brijbyte/md3-react/slider";
import VolumeUp from "@brijbyte/md3-icons/outlined/VolumeUp";

const sizes = ["xs", "s", "m", "l", "xl"] as const;

export default function SliderSizesDemo() {
  return (
    <div className="demo-slider-sizes">
      {sizes.map((size) => (
        <div key={size} className="demo-slider-sizes-item">
          <span className="demo-slider-sizes-label">{size}</span>
          <Slider aria-label={size} size={size} defaultValue={60} icon={<VolumeUp />} />
        </div>
      ))}
    </div>
  );
}

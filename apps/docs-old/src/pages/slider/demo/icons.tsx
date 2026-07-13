import "./icons.css";

import { Slider } from "@brijbyte/md3-react/slider";
import VolumeDown from "@brijbyte/md3-icons/outlined/VolumeDown";
import VolumeUp from "@brijbyte/md3-icons/outlined/VolumeUp";

export default function SliderIconsDemo() {
  return (
    <div className="demo-slider-icons">
      <VolumeDown />
      <Slider aria-label="Volume" defaultValue={70} />
      <VolumeUp />
    </div>
  );
}

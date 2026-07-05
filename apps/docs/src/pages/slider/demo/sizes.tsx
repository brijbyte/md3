import "./sizes.css";

import { Slider } from "@brijbyte/md3-react/slider";
import VolumeUp from "@brijbyte/md3-icons/outlined/VolumeUp";

export default function SliderSizesDemo() {
  return (
    <div className="demo-slider-sizes">
      <Slider aria-label="Extra small" size="xs" defaultValue={60} />
      <Slider aria-label="Small" size="s" defaultValue={60} />
      <Slider aria-label="Medium" size="m" defaultValue={60} icon={<VolumeUp />} />
      <Slider aria-label="Large" size="l" defaultValue={60} icon={<VolumeUp />} />
      <Slider aria-label="Extra large" size="xl" defaultValue={60} icon={<VolumeUp />} />
    </div>
  );
}

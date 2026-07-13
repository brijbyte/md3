import "./states.css";

import { Slider } from "@brijbyte/md3-react/slider";

export default function SliderStatesDemo() {
  return (
    <div className="demo-slider-states">
      <Slider aria-label="Volume" defaultValue={40} />
      <Slider aria-label="Discrete" defaultValue={3} min={0} max={5} step={1} ticks />
      <Slider aria-label="Disabled" defaultValue={60} disabled />
    </div>
  );
}

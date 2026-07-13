import "./centered.css";

import { Slider } from "@brijbyte/md3-react/slider";

export default function SliderCenteredDemo() {
  return (
    <div className="demo-slider-centered">
      <Slider aria-label="Balance" centered min={-50} max={50} defaultValue={0} />
    </div>
  );
}

import "./groups.css";

import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";

export default function RadioGroupsDemo() {
  return (
    <>
      <div className="demo-radio-row">
        <span className="demo-radio-label">group</span>
        <RadioGroup defaultValue="a" className="demo-radio-group">
          <Radio value="a" aria-label="Option A" />
          <Radio value="b" aria-label="Option B" />
          <Radio value="c" aria-label="Option C" disabled />
        </RadioGroup>
      </div>
      <div className="demo-radio-row">
        <span className="demo-radio-label">disabled</span>
        <RadioGroup defaultValue="a" disabled className="demo-radio-group">
          <Radio value="a" aria-label="Disabled selected" />
          <Radio value="b" aria-label="Disabled unselected" />
        </RadioGroup>
      </div>
    </>
  );
}

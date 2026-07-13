import "@brijbyte/md3-react/checkbox.css";
import "./states.css";

import { Checkbox } from "@brijbyte/md3-react/checkbox";

export default function CheckboxStatesDemo() {
  return (
    <div className="demo-checkbox-states">
      <label className="demo-checkbox-item">
        <Checkbox aria-label="Unchecked" />
        Unchecked
      </label>
      <label className="demo-checkbox-item">
        <Checkbox aria-label="Checked" defaultChecked />
        Checked
      </label>
      <label className="demo-checkbox-item">
        <Checkbox aria-label="Indeterminate" indeterminate />
        Indeterminate
      </label>
      <label className="demo-checkbox-item">
        <Checkbox aria-label="Disabled" disabled />
        Disabled
      </label>
      <label className="demo-checkbox-item">
        <Checkbox aria-label="Disabled checked" disabled defaultChecked />
        Disabled checked
      </label>
    </div>
  );
}

import "./states.css";

import { Checkbox } from "@brijbyte/md3-react/checkbox";

export default function CheckboxStatesDemo() {
  return (
    <div className="demo-checkbox-states">
      <Checkbox aria-label="Unchecked" />
      <Checkbox aria-label="Checked" defaultChecked />
      <Checkbox aria-label="Indeterminate" indeterminate />
      <Checkbox aria-label="Disabled" disabled />
      <Checkbox aria-label="Disabled checked" disabled defaultChecked />
    </div>
  );
}

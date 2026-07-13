import "./error-state.css";

import { Checkbox } from "@brijbyte/md3-react/checkbox";

export default function CheckboxErrorDemo() {
  return (
    <div className="demo-checkbox-error">
      <label className="demo-checkbox-error-item">
        <Checkbox aria-label="Error unchecked" error />
        Unchecked
      </label>
      <label className="demo-checkbox-error-item">
        <Checkbox aria-label="Error checked" error defaultChecked />
        Checked
      </label>
      <label className="demo-checkbox-error-item">
        <Checkbox aria-label="Error indeterminate" error indeterminate />
        Indeterminate
      </label>
    </div>
  );
}

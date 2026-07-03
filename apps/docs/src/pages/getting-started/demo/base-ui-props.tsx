import "./base-ui-props.css";

import { Button } from "@brijbyte/md3-react/button";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Switch } from "@brijbyte/md3-react/switch";

export default function BaseUiPropsDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
      <Checkbox defaultChecked aria-label="Demo checkbox" />
      <Switch defaultChecked aria-label="Demo switch" />
      <Button disabled>Disabled</Button>
    </div>
  );
}

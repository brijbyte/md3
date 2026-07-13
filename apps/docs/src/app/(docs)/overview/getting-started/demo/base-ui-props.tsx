import "@brijbyte/md3-react/tokens.css";
import "@brijbyte/md3-react/ripple.css";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/checkbox.css";
import "@brijbyte/md3-react/switch.css";
import "./base-ui-props.css";

import { Button } from "@brijbyte/md3-react/button";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Switch } from "@brijbyte/md3-react/switch";

export default function BaseUiPropsDemo() {
  return (
    <div className="demo-base-ui-props">
      <Checkbox defaultChecked aria-label="Demo checkbox" />
      <Switch defaultChecked aria-label="Demo switch" />
      <Button disabled>Disabled</Button>
    </div>
  );
}

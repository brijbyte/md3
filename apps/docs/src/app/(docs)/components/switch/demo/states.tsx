import "./states.css";

import { Switch } from "@brijbyte/md3-react/switch";

export default function SwitchStatesDemo() {
  return (
    <div className="demo-switch-states">
      <Switch aria-label="Off" />
      <Switch aria-label="On" defaultChecked />
      <Switch aria-label="Disabled off" disabled />
      <Switch aria-label="Disabled on" disabled defaultChecked />
    </div>
  );
}

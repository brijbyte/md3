import { Switch } from "@brijbyte/md3-react/switch";
import { Row, Section } from "../components/demo";

export default function SwitchPage() {
  return (
    <Section title="States">
      <Row label="states">
        <Switch aria-label="Off" />
        <Switch aria-label="On" defaultChecked />
        <Switch aria-label="Disabled off" disabled />
        <Switch aria-label="Disabled on" disabled defaultChecked />
      </Row>
    </Section>
  );
}

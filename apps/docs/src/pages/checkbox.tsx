import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Row, Section } from "../components/demo";

export default function CheckboxPage() {
  return (
    <Section title="States">
      <Row label="states">
        <Checkbox aria-label="Unchecked" />
        <Checkbox aria-label="Checked" defaultChecked />
        <Checkbox aria-label="Indeterminate" indeterminate />
        <Checkbox aria-label="Disabled" disabled />
        <Checkbox aria-label="Disabled checked" disabled defaultChecked />
      </Row>
    </Section>
  );
}

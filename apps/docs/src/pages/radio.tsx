import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Row, Section } from "../components/demo";

export default function RadioPage() {
  return (
    <Section title="States">
      <Row label="group">
        <RadioGroup defaultValue="a" className="flex gap-2">
          <Radio value="a" aria-label="Option A" />
          <Radio value="b" aria-label="Option B" />
          <Radio value="c" aria-label="Option C" disabled />
        </RadioGroup>
      </Row>
      <Row label="disabled">
        <RadioGroup defaultValue="a" disabled className="flex gap-2">
          <Radio value="a" aria-label="Disabled selected" />
          <Radio value="b" aria-label="Disabled unselected" />
        </RadioGroup>
      </Row>
    </Section>
  );
}

import "@brijbyte/md3-react/radio.css";
import "@brijbyte/md3-react/typography.css";
import "./labels.css";

import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Typography } from "@brijbyte/md3-react/typography";

export default function RadioLabelsDemo() {
  return (
    <RadioGroup defaultValue="standard" className="demo-radio-labels-group">
      <Typography as="label" variant="body-large" className="demo-radio-labels-item">
        <Radio value="standard" />
        Standard shipping
      </Typography>
      <Typography as="label" variant="body-large" className="demo-radio-labels-item">
        <Radio value="express" />
        Express shipping
      </Typography>
      <Typography as="label" variant="body-large" className="demo-radio-labels-item">
        <Radio value="overnight" disabled />
        Overnight shipping
      </Typography>
    </RadioGroup>
  );
}

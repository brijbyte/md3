import "./adjacent-label.css";
import { Typography } from "@brijbyte/md3-react/typography";
import { TextField } from "@brijbyte/md3-react/text-field";

export default function TextFieldAdjacentLabelDemo() {
  return (
    <div className="demo-text-field-adjacent-label">
      <Typography variant="label-large" as="label" htmlFor="display-name">
        Display name
      </Typography>
      <TextField id="display-name" defaultValue="Ada Lovelace" />
    </div>
  );
}

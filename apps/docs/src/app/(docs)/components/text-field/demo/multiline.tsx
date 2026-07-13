import "@brijbyte/md3-react/text-field.css";
import "./multiline.css";
import { TextField } from "@brijbyte/md3-react/text-field";

export default function TextFieldMultilineDemo() {
  return (
    <div className="demo-text-field-multiline">
      <TextField
        variant="outlined"
        label="Message"
        multiline
        supportingText="It grows as you type — no scrollbar until it hits the page's limit."
      />
    </div>
  );
}

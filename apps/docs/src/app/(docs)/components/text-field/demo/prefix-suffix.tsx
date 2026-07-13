import "@brijbyte/md3-react/text-field.css";
import "./prefix-suffix.css";
import { TextField } from "@brijbyte/md3-react/text-field";

export default function TextFieldPrefixSuffixDemo() {
  return (
    <div className="demo-text-field-prefix-suffix">
      <TextField variant="outlined" label="Price" prefix="$" suffix="USD" defaultValue="20" />
      <TextField variant="outlined" label="Website" prefix="https://" defaultValue="brijbyte.com" />
    </div>
  );
}

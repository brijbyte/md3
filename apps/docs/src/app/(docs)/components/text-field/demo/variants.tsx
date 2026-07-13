import "@brijbyte/md3-react/text-field.css";
import "./variants.css";
import { TextField } from "@brijbyte/md3-react/text-field";

export default function TextFieldVariantsDemo() {
  return (
    <div className="demo-text-field-variants">
      <TextField variant="filled" label="Filled" />
      <TextField variant="outlined" label="Outlined" />
      <TextField variant="filled" label="Disabled" disabled defaultValue="Can't edit this" />
      <TextField variant="outlined" label="Disabled" disabled defaultValue="Can't edit this" />
    </div>
  );
}

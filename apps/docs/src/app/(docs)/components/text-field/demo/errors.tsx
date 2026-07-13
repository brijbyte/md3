import "@brijbyte/md3-react/text-field.css";
import "./errors.css";
import { TextField } from "@brijbyte/md3-react/text-field";

export default function TextFieldErrorsDemo() {
  return (
    <div className="demo-text-field-errors">
      <TextField
        variant="filled"
        label="Username"
        error
        defaultValue="taken-username"
        supportingText="That username is already taken."
      />
      <TextField
        variant="outlined"
        label="Username"
        error
        defaultValue="taken-username"
        supportingText="That username is already taken."
      />
    </div>
  );
}

import "@brijbyte/md3-react/text-field.css";
import "./single-line.css";
import { TextField } from "@brijbyte/md3-react/text-field";

export default function TextFieldSingleLineDemo() {
  return (
    <form className="demo-text-field-single-line">
      <TextField label="Full name" name="name" autoComplete="name" />
      <TextField label="Email address" name="email" type="email" autoComplete="email" />
    </form>
  );
}

"use client";
import "./field-error.css";
import { Field } from "@base-ui/react/field";
import { TextField } from "@brijbyte/md3-react/text-field";

export default function TextFieldFieldErrorDemo() {
  return (
    <div className="demo-text-field-field-error">
      <TextField
        variant="outlined"
        label="Email address"
        type="email"
        required
        validationMode="onChange"
        supportingText={
          <>
            <Field.Error match="valueMissing">An email address is required.</Field.Error>
            <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
          </>
        }
      />
    </div>
  );
}

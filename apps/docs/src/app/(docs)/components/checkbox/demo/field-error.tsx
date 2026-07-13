"use client";
import "@brijbyte/md3-react/checkbox.css";
import "./field-error.css";

import { Field } from "@base-ui/react/field";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Typography } from "@brijbyte/md3-react/typography";

export default function CheckboxFieldErrorDemo() {
  return (
    <Field.Root className="demo-checkbox-field" validationMode="onChange">
      <Field.Label
        className="demo-checkbox-field-label"
        render={<Typography variant="label-small" as="label" />}
      >
        <Checkbox required />I agree to the terms
      </Field.Label>
      {/* Slot keeps its height when the error unmounts, so the layout never jumps */}
      <span className="demo-checkbox-field-message-slot">
        <Field.Error className="demo-checkbox-field-message" match="valueMissing">
          You must accept the terms to continue.
        </Field.Error>
      </span>
    </Field.Root>
  );
}

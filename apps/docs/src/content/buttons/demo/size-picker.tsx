import "./size-picker.css";

import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";

export function SizePicker<Size extends string>({
  sizes,
  value,
  onChange,
}: {
  sizes: readonly Size[];
  value: Size;
  onChange: (size: Size) => void;
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(size) => onChange(size as Size)}
      aria-label="Size"
      className="demo-size-picker"
    >
      {sizes.map((size) => (
        <label key={size} className="demo-size-option">
          <Radio value={size} />
          {size}
        </label>
      ))}
    </RadioGroup>
  );
}

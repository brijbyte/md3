import "@brijbyte/md3-react/menu.css";
import "@brijbyte/md3-react/text-field.css";
import "@brijbyte/md3-react/select.css";
import "./variants.css";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@brijbyte/md3-react/select";

const PHONE_TYPES = [
  { value: "mobile", label: "Mobile" },
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
];

function PhoneTypeSelect({ variant }: { variant: "filled" | "outlined" }) {
  return (
    <Select variant={variant} items={PHONE_TYPES} defaultValue="mobile">
      <SelectTrigger label="Phone type" />
      <SelectContent>
        {PHONE_TYPES.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function SelectVariantsDemo() {
  return (
    <div className="demo-select-variants">
      <PhoneTypeSelect variant="filled" />
      <PhoneTypeSelect variant="outlined" />
    </div>
  );
}

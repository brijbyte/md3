import "@brijbyte/md3-react/menu.css";
import "@brijbyte/md3-react/text-field.css";
import "@brijbyte/md3-react/select.css";
import "./scrollable.css";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@brijbyte/md3-react/select";

const FONTS = [
  "Amarante",
  "Arvo",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Google Sans",
  "Lato",
  "Merriweather",
  "Montserrat",
  "Open Sans",
  "Roboto",
  "Times New Roman",
  "Verdana",
];

export default function SelectScrollableDemo() {
  return (
    <div className="demo-select-scrollable">
      <Select variant="outlined" defaultValue="Roboto">
        <SelectTrigger label="Font" />
        <SelectContent className="demo-select-scrollable-menu">
          {FONTS.map((font) => (
            <SelectItem key={font} value={font}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

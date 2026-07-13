"use client";
import "@brijbyte/md3-react/menu.css";
import "@brijbyte/md3-react/text-field.css";
import "@brijbyte/md3-react/select.css";
import "./selection.css";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@brijbyte/md3-react/select";

const DIETS = ["Gluten-free", "Kosher", "Nut-free", "Vegan", "Vegetarian"];

export default function SelectSelectionDemo() {
  return (
    <div className="demo-select-selection">
      <Select variant="outlined" defaultValue="Nut-free">
        <SelectTrigger label="Diet" />
        <SelectContent>
          {DIETS.map((diet) => (
            <SelectItem key={diet} value={diet}>
              {diet}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select variant="outlined" multiple defaultValue={["Nut-free", "Vegan"]}>
        <SelectTrigger label="Diet" renderValue={(diets: string[]) => diets.join(", ")} />
        <SelectContent>
          {DIETS.map((diet) => (
            <SelectItem key={diet} value={diet}>
              {diet}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

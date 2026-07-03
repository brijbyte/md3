import "./first-buttons.css";

import { Button } from "@brijbyte/md3-react/button";
import AddIcon from "@brijbyte/md3-icons/outlined/add";

export default function FirstButtonsDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
      <Button icon={<AddIcon />}>Add item</Button>
      <Button variant="tonal" icon={<AddIcon />}>
        Add item
      </Button>
      <Button variant="outlined">Outlined</Button>
    </div>
  );
}

import "@brijbyte/md3-react/button.css";
import "./first-buttons.css";

import { Button } from "@brijbyte/md3-react/button";
import AddIcon from "@brijbyte/md3-icons/outlined/Add";

export default function FirstButtonsDemo() {
  return (
    <div className="demo-first-buttons">
      <Button icon={<AddIcon />}>Add item</Button>
      <Button variant="tonal" icon={<AddIcon />}>
        Add item
      </Button>
      <Button variant="outlined">Outlined</Button>
    </div>
  );
}

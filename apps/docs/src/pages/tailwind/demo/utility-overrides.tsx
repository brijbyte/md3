import "./utility-overrides.css";

import { Button } from "@brijbyte/md3-react/button";
import { Fab } from "@brijbyte/md3-react/fab";
import AddIcon from "@brijbyte/md3-icons/outlined/add";

// Utilities come from the consuming app's Tailwind build (hence the tailwindcss
// dep); being unlayered they win over the md3.components layer — no !important.
export default function UtilityOverridesDemo() {
  return (
    <div className="demo-utility-overrides">
      <Button className="rounded-lg">rounded-lg</Button>
      <Button className="bg-fuchsia-600">bg-fuchsia-600</Button>
      <Button variant="outlined" className="px-10">
        px-10
      </Button>
      <Fab
        aria-label="Squarish teal FAB"
        icon={<AddIcon />}
        className="rounded-md bg-teal-600 text-white"
      />
    </div>
  );
}

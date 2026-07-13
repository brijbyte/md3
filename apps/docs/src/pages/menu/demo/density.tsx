import "./density.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  type MenuDensity,
} from "@brijbyte/md3-react/menu";
import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import VisibilityIcon from "@brijbyte/md3-icons/outlined/Visibility";

const DENSITIES: MenuDensity[] = [0, -1, -2, -3];

export default function MenuDensityDemo() {
  return (
    <div className="demo-menu-density">
      {DENSITIES.map((density) => (
        <Menu key={density}>
          <MenuTrigger render={<Button variant="outlined" />}>Density {density}</MenuTrigger>
          <MenuContent density={density}>
            <MenuItem leadingIcon={<VisibilityIcon />}>Preview</MenuItem>
            <MenuItem leadingIcon={<ContentCopyIcon />} trailingText="⌘C">
              Copy
            </MenuItem>
            <MenuItem leadingIcon={<EditIcon />}>Rename</MenuItem>
          </MenuContent>
        </Menu>
      ))}
    </div>
  );
}

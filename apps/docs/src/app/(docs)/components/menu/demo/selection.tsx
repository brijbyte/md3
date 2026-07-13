import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/menu.css";
import "./selection.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@brijbyte/md3-react/menu";
import SortIcon from "@brijbyte/md3-icons/outlined/Sort";

export default function MenuSelectionDemo() {
  return (
    <div className="demo-menu-selection">
      <Menu>
        <MenuTrigger render={<Button variant="outlined" icon={<SortIcon />} />}>
          Sort by
        </MenuTrigger>
        <MenuContent>
          <MenuRadioGroup defaultValue="date">
            <MenuRadioItem value="name">Name</MenuRadioItem>
            <MenuRadioItem value="date">Date modified</MenuRadioItem>
            <MenuRadioItem value="size">Size</MenuRadioItem>
          </MenuRadioGroup>
          <MenuSeparator />
          <MenuCheckboxItem defaultChecked>Show hidden files</MenuCheckboxItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

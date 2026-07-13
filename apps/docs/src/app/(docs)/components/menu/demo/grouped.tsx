import "./grouped.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from "@brijbyte/md3-react/menu";

export default function MenuGroupedDemo() {
  return (
    <div className="demo-menu-grouped">
      <Menu>
        <MenuTrigger render={<Button variant="filled" />}>Grouped menu</MenuTrigger>
        <MenuContent variant="segmented">
          <MenuGroup>
            <MenuRadioGroup defaultValue="two">
              <MenuRadioItem value="one">Item 1</MenuRadioItem>
              <MenuRadioItem value="two">Item 2</MenuRadioItem>
              <MenuRadioItem value="three">Item 3</MenuRadioItem>
            </MenuRadioGroup>
          </MenuGroup>
          <MenuGroup>
            <MenuItem trailingText="⌘C">Item 4</MenuItem>
            <MenuItem>Item 5</MenuItem>
          </MenuGroup>
        </MenuContent>
      </Menu>
    </div>
  );
}

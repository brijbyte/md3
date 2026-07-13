import "./basic.css";

import { Button } from "@brijbyte/md3-react/button";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@brijbyte/md3-react/menu";

export default function BasicMenuDemo() {
  return (
    <div className="demo-menu-basic">
      <Menu>
        <MenuTrigger render={<Button variant="tonal" />}>Open menu</MenuTrigger>
        <MenuContent>
          <MenuItem>Revert</MenuItem>
          <MenuItem>Settings</MenuItem>
          <MenuItem>Send feedback</MenuItem>
          <MenuItem disabled>Help</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

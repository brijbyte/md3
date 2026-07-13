import "./submenu.css";

import { Button } from "@brijbyte/md3-react/button";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuSubmenu,
  MenuSubmenuTrigger,
  MenuTrigger,
} from "@brijbyte/md3-react/menu";
import DownloadIcon from "@brijbyte/md3-icons/outlined/Download";
import LinkIcon from "@brijbyte/md3-icons/outlined/Link";
import ShareIcon from "@brijbyte/md3-icons/outlined/Share";

export default function SubmenuDemo() {
  return (
    <div className="demo-menu-submenu">
      <Menu>
        <MenuTrigger render={<Button variant="elevated" />}>File actions</MenuTrigger>
        <MenuContent>
          <MenuGroup label="Document">
            <MenuItem>Rename</MenuItem>
            <MenuItem>Duplicate</MenuItem>
          </MenuGroup>
          <MenuSubmenu>
            <MenuSubmenuTrigger leadingIcon={<ShareIcon />}>Share</MenuSubmenuTrigger>
            <MenuContent>
              <MenuItem leadingIcon={<LinkIcon />}>Copy link</MenuItem>
              <MenuItem leadingIcon={<DownloadIcon />}>Download</MenuItem>
            </MenuContent>
          </MenuSubmenu>
        </MenuContent>
      </Menu>
    </div>
  );
}

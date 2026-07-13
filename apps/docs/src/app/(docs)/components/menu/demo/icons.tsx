import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/menu.css";
import "./icons.css";

import { IconButton } from "@brijbyte/md3-react/icon-button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@brijbyte/md3-react/menu";
import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import ContentCutIcon from "@brijbyte/md3-icons/outlined/ContentCut";
import ContentPasteIcon from "@brijbyte/md3-icons/outlined/ContentPaste";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";
import MoreVertIcon from "@brijbyte/md3-icons/outlined/MoreVert";

export default function MenuIconsDemo() {
  return (
    <div className="demo-menu-icons">
      <Menu>
        <MenuTrigger render={<IconButton aria-label="More options" />}>
          <MoreVertIcon />
        </MenuTrigger>
        <MenuContent>
          <MenuItem leadingIcon={<ContentCutIcon />} trailingText="⌘X">
            Cut
          </MenuItem>
          <MenuItem leadingIcon={<ContentCopyIcon />} trailingText="⌘C">
            Copy
          </MenuItem>
          <MenuItem leadingIcon={<ContentPasteIcon />} trailingText="⌘V" disabled>
            Paste
          </MenuItem>
          <MenuSeparator />
          <MenuItem leadingIcon={<DeleteIcon />}>Delete</MenuItem>
        </MenuContent>
      </Menu>
    </div>
  );
}

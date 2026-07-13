import "@brijbyte/md3-react/menu.css";
import "./context-menu.css";

import {
  ContextMenu,
  ContextMenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
} from "@brijbyte/md3-react/menu";
import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import ContentCutIcon from "@brijbyte/md3-icons/outlined/ContentCut";
import ContentPasteIcon from "@brijbyte/md3-icons/outlined/ContentPaste";
import RedoIcon from "@brijbyte/md3-icons/outlined/Redo";
import UndoIcon from "@brijbyte/md3-icons/outlined/Undo";

export default function ContextMenuDemo() {
  return (
    <div className="demo-menu-context">
      <ContextMenu>
        <ContextMenuTrigger className="demo-menu-context-area">Right-click here</ContextMenuTrigger>
        <MenuContent>
          <MenuItem leadingIcon={<UndoIcon />} trailingText="⌘Z">
            Undo
          </MenuItem>
          <MenuItem leadingIcon={<RedoIcon />} trailingText="⌘⇧Z" disabled>
            Redo
          </MenuItem>
          <MenuSeparator />
          <MenuItem leadingIcon={<ContentCutIcon />} trailingText="⌘X">
            Cut
          </MenuItem>
          <MenuItem leadingIcon={<ContentCopyIcon />} trailingText="⌘C">
            Copy
          </MenuItem>
          <MenuItem leadingIcon={<ContentPasteIcon />} trailingText="⌘V">
            Paste
          </MenuItem>
        </MenuContent>
      </ContextMenu>
    </div>
  );
}

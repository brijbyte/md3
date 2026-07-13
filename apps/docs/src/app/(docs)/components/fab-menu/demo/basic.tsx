import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/fab-menu.css";
import "./basic.css";

import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import ChatIcon from "@brijbyte/md3-icons/outlined/Chat";
import DescriptionIcon from "@brijbyte/md3-icons/outlined/Description";
import FolderIcon from "@brijbyte/md3-icons/outlined/Folder";
import ImageIcon from "@brijbyte/md3-icons/outlined/Image";
import { FabMenu, FabMenuContent, FabMenuItem, FabMenuTrigger } from "@brijbyte/md3-react/fab-menu";

export default function BasicFabMenuDemo() {
  return (
    <div className="demo-fab-menu-basic">
      <FabMenu>
        <FabMenuTrigger aria-label="Create" icon={<AddIcon />} />
        <FabMenuContent>
          <FabMenuItem icon={<ImageIcon />}>Image</FabMenuItem>
          <FabMenuItem icon={<FolderIcon />}>Folder</FabMenuItem>
          <FabMenuItem icon={<ChatIcon />}>Message</FabMenuItem>
          <FabMenuItem icon={<DescriptionIcon />}>Document</FabMenuItem>
        </FabMenuContent>
      </FabMenu>
    </div>
  );
}

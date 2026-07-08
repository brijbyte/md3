import "./lines.css";

import { List, ListItem } from "@brijbyte/md3-react/list";
import FolderIcon from "@brijbyte/md3-icons/outlined/Folder";
import ImageIcon from "@brijbyte/md3-icons/outlined/Image";
import ChevronRightIcon from "@brijbyte/md3-icons/outlined/ChevronRight";

export default function ListLinesDemo() {
  return (
    <List className="demo-list">
      <ListItem leading={<FolderIcon />} trailingSupportingText="24">
        Documents
      </ListItem>
      <ListItem
        leading={<ImageIcon />}
        supportingText="Edited 2 days ago"
        trailing={<ChevronRightIcon />}
      >
        Photos
      </ListItem>
      <ListItem
        leading={<FolderIcon />}
        overline="SHARED"
        supportingText="Long-press an item to change who can see it and edit it."
        lines={3}
        trailing={<ChevronRightIcon />}
      >
        Team drive
      </ListItem>
    </List>
  );
}

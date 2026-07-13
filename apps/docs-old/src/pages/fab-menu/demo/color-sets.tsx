import "./color-sets.css";

import ArchiveIcon from "@brijbyte/md3-icons/outlined/Archive";
import ReplyIcon from "@brijbyte/md3-icons/outlined/Reply";
import ShareIcon from "@brijbyte/md3-icons/outlined/Share";
import SnoozeIcon from "@brijbyte/md3-icons/outlined/Snooze";
import {
  FabMenu,
  FabMenuContent,
  FabMenuItem,
  FabMenuTrigger,
  type FabMenuColor,
} from "@brijbyte/md3-react/fab-menu";

const colors: FabMenuColor[] = ["primary", "secondary", "tertiary"];

export default function FabMenuColorSetsDemo() {
  return (
    <div className="demo-fab-menu-colors">
      {colors.map((color) => (
        <FabMenu key={color} color={color}>
          <FabMenuTrigger aria-label={`Reply (${color})`} icon={<ReplyIcon />} />
          <FabMenuContent>
            <FabMenuItem icon={<SnoozeIcon />}>Snooze</FabMenuItem>
            <FabMenuItem icon={<ArchiveIcon />}>Archive</FabMenuItem>
            <FabMenuItem icon={<ShareIcon />}>Share</FabMenuItem>
          </FabMenuContent>
        </FabMenu>
      ))}
    </div>
  );
}

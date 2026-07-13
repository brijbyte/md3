import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/tooltip.css";
import "./toolbar.css";

import { IconButton } from "@brijbyte/md3-react/icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@brijbyte/md3-react/tooltip";
import MoreVertIcon from "@brijbyte/md3-icons/outlined/MoreVert";
import PersonAddIcon from "@brijbyte/md3-icons/outlined/PersonAdd";
import StarIcon from "@brijbyte/md3-icons/outlined/Star";

const ITEMS = [
  { label: "Share", icon: <PersonAddIcon /> },
  { label: "Star", icon: <StarIcon /> },
  { label: "More options", icon: <MoreVertIcon /> },
];

export default function ToolbarTooltipDemo() {
  return (
    <div className="demo-tooltip-toolbar">
      {/* Per spec, a lingering tooltip should stay put for 1.5s once the pointer
          leaves every trigger, giving users time to move toward it if needed. */}
      <TooltipProvider closeDelay={1500}>
        {ITEMS.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger render={<IconButton aria-label={item.label} />}>
              {item.icon}
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}

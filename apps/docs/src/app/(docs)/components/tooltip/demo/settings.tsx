import "./settings.css";

import { Button } from "@brijbyte/md3-react/button";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { RichTooltip, RichTooltipContent, RichTooltipTrigger } from "@brijbyte/md3-react/tooltip";
import SettingsIcon from "@brijbyte/md3-icons/outlined/Settings";

export default function SettingsTooltipDemo() {
  return (
    <div className="demo-tooltip-settings">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="demo-tooltip-settings-tile" />
      ))}
      <RichTooltip>
        <RichTooltipTrigger
          render={<IconButton aria-label="Settings" className="demo-tooltip-settings-anchor" />}
        >
          <SettingsIcon />
        </RichTooltipTrigger>
        <RichTooltipContent
          title="New settings available"
          action={<Button variant="text">Learn more</Button>}
          align="start"
          positionerProps={{ collisionAvoidance: { side: "flip", align: "shift" } }}
        >
          Now you can adjust the uploaded image quality, and upgrade your available storage space.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  );
}

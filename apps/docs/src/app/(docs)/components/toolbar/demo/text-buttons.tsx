import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/toolbar.css";
import "./text-buttons.css";

import { Button } from "@brijbyte/md3-react/button";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { Toolbar, ToolbarButton, ToolbarInput } from "@brijbyte/md3-react/toolbar";
import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import AddReactionIcon from "@brijbyte/md3-icons/outlined/AddReaction";
import ArrowBackIcon from "@brijbyte/md3-icons/outlined/ArrowBack";
import ArrowForwardIcon from "@brijbyte/md3-icons/outlined/ArrowForward";
import ImageIcon from "@brijbyte/md3-icons/outlined/Image";
import MoreVertIcon from "@brijbyte/md3-icons/outlined/MoreVert";
import WebAssetIcon from "@brijbyte/md3-icons/outlined/WebAsset";

// The guidelines' slots figure: any control fits a toolbar slot — here icon
// buttons beside a pill of text buttons with one tonal selection.
export default function ToolbarTextButtonsDemo() {
  return (
    <div className="demo-toolbar-slots">
      <Toolbar variant="floating" aria-label="Browser controls">
        <ToolbarButton
          render={
            <IconButton aria-label="Back">
              <ArrowBackIcon />
            </IconButton>
          }
        />
        <ToolbarButton
          render={
            <IconButton aria-label="Forward">
              <ArrowForwardIcon />
            </IconButton>
          }
        />
        <ToolbarButton
          render={
            <IconButton variant="filled" aria-label="New tab">
              <AddIcon />
            </IconButton>
          }
        />
        <ToolbarButton
          render={
            <IconButton aria-label="Open tabs">
              <WebAssetIcon />
            </IconButton>
          }
        />
        <ToolbarButton
          render={
            <IconButton aria-label="More options">
              <MoreVertIcon />
            </IconButton>
          }
        />
      </Toolbar>

      <Toolbar variant="floating" aria-label="Library sections">
        <ToolbarButton
          render={
            <Button variant="tonal" icon={<ImageIcon />}>
              Photos
            </Button>
          }
        />
        <ToolbarButton render={<Button variant="text">Memories</Button>} />
        <ToolbarButton render={<Button variant="text">Library</Button>} />
      </Toolbar>

      <Toolbar variant="floating" aria-label="Message" className="demo-toolbar-chat">
        <ToolbarInput aria-label="Message" defaultValue="I'll be there shortly!" />
        <ToolbarButton
          render={
            <IconButton aria-label="Add reaction">
              <AddReactionIcon />
            </IconButton>
          }
        />
      </Toolbar>
    </div>
  );
}

import "@brijbyte/md3-react/ripple.css";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/toolbar.css";
import "./docked.css";

import { IconButton } from "@brijbyte/md3-react/icon-button";
import { Toolbar, ToolbarButton } from "@brijbyte/md3-react/toolbar";
import { Typography } from "@brijbyte/md3-react/typography";
import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import ArrowBackIcon from "@brijbyte/md3-icons/outlined/ArrowBack";
import ArrowForwardIcon from "@brijbyte/md3-icons/outlined/ArrowForward";
import MoreVertIcon from "@brijbyte/md3-icons/outlined/MoreVert";
import WebAssetIcon from "@brijbyte/md3-icons/outlined/WebAsset";

// Browser-style global controls, after the MD3 guidelines' docked example:
// one filled icon button gives the primary action emphasis.
export default function ToolbarDockedDemo() {
  return (
    <div className="demo-toolbar-screen">
      <div className="demo-toolbar-body">
        <Typography variant="title-medium">Citizen science</Typography>
        <Typography variant="body-medium" className="demo-toolbar-muted">
          Citizen science, the involvement of the public in scientific research, has seen a
          remarkable surge in popularity in recent years. This trend is fueled by the increasing
          accessibility of technology and a growing public interest in science.
        </Typography>
        <Typography variant="body-medium" className="demo-toolbar-muted">
          Participants develop valuable skills in data collection, analysis, and critical thinking,
          while researchers gain access to observations at a scale no single lab could gather.
          However, citizen science projects also raise questions about data quality and the fair
          attribution of contributions.
        </Typography>
      </div>
      <Toolbar aria-label="Browser controls">
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
    </div>
  );
}

import "@brijbyte/md3-react/ripple.css";
import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/toolbar.css";
import "./floating.css";

import { IconButton } from "@brijbyte/md3-react/icon-button";
import { Toolbar, ToolbarButton } from "@brijbyte/md3-react/toolbar";
import { Typography } from "@brijbyte/md3-react/typography";
import ArchiveIcon from "@brijbyte/md3-icons/outlined/Archive";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";
import FormatBoldIcon from "@brijbyte/md3-icons/outlined/FormatBold";
import FormatColorFillIcon from "@brijbyte/md3-icons/outlined/FormatColorFill";
import FormatColorTextIcon from "@brijbyte/md3-icons/outlined/FormatColorText";
import FormatItalicIcon from "@brijbyte/md3-icons/outlined/FormatItalic";
import FormatUnderlinedIcon from "@brijbyte/md3-icons/outlined/FormatUnderlined";
import MailIcon from "@brijbyte/md3-icons/outlined/Mail";
import MoreVertIcon from "@brijbyte/md3-icons/outlined/MoreVert";
import SnoozeIcon from "@brijbyte/md3-icons/outlined/Snooze";

const PROSE = `But honestly, the real highlight (at least for me!) is definitely the puppy!
I can't wait to meet our adorable little furry friend — picture all the cuddles and playtime.
And the pool? Perfect for cooling off on a hot summer day. There's even a game room, so I'm
already envisioning evenings filled with laughter as we play games and just enjoy each other's
company. What do you think? Are you free on Saturday afternoon? We could take a look together,
grab some coffee afterwards and make a whole day of it! Let me know if you're interested.`;

function Prose() {
  return (
    <Typography variant="body-medium" className="demo-toolbar-prose">
      {PROSE}
    </Typography>
  );
}

export default function ToolbarFloatingDemo() {
  return (
    <div className="demo-toolbar-row">
      {/* Standard scheme: text formatting over the content being edited. */}
      <div className="demo-toolbar-canvas">
        <Prose />
        <Toolbar variant="floating" aria-label="Formatting" className="demo-toolbar-bottom">
          <ToolbarButton
            render={
              <IconButton toggle defaultPressed aria-label="Bold">
                <FormatBoldIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton toggle aria-label="Italic">
                <FormatItalicIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton toggle aria-label="Underline">
                <FormatUnderlinedIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton aria-label="Text color">
                <FormatColorTextIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton aria-label="Highlight color">
                <FormatColorFillIcon />
              </IconButton>
            }
          />
        </Toolbar>
      </div>

      {/* Vibrant scheme: email triage actions that pop against the content. */}
      <div className="demo-toolbar-canvas">
        <Prose />
        <Toolbar
          variant="floating"
          color="vibrant"
          aria-label="Message actions"
          className="demo-toolbar-bottom"
        >
          <ToolbarButton
            render={
              <IconButton aria-label="Archive">
                <ArchiveIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton aria-label="Delete">
                <DeleteIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton aria-label="Mark unread">
                <MailIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton aria-label="Snooze">
                <SnoozeIcon />
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

      {/* Vertical: formatting rail on the side in larger windows. */}
      <div className="demo-toolbar-canvas demo-toolbar-canvas-vertical">
        <Prose />
        <Toolbar
          variant="floating"
          orientation="vertical"
          aria-label="Formatting"
          className="demo-toolbar-edge"
        >
          <ToolbarButton
            render={
              <IconButton toggle defaultPressed aria-label="Bold">
                <FormatBoldIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton toggle aria-label="Italic">
                <FormatItalicIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton toggle aria-label="Underline">
                <FormatUnderlinedIcon />
              </IconButton>
            }
          />
          <ToolbarButton
            render={
              <IconButton aria-label="Text color">
                <FormatColorTextIcon />
              </IconButton>
            }
          />
        </Toolbar>
      </div>
    </div>
  );
}

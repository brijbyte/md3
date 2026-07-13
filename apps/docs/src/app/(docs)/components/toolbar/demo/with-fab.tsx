import "./with-fab.css";

import { Fab } from "@brijbyte/md3-react/fab";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { Toolbar, ToolbarButton } from "@brijbyte/md3-react/toolbar";
import { Typography } from "@brijbyte/md3-react/typography";
import ArchiveIcon from "@brijbyte/md3-icons/outlined/Archive";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";
import MoreVertIcon from "@brijbyte/md3-icons/outlined/MoreVert";
import ReplyIcon from "@brijbyte/md3-icons/outlined/Reply";
import SnoozeIcon from "@brijbyte/md3-icons/outlined/Snooze";

// The guidelines' email example: vibrant triage toolbar + tertiary reply FAB.
export default function ToolbarWithFabDemo() {
  return (
    <div className="demo-toolbar-fab-canvas">
      <Typography variant="title-medium">Our cabin for the weekend</Typography>
      <Typography variant="body-medium" className="demo-toolbar-fab-prose">
        Hey!!! I've got pics and more info on our cabin for the weekend! Get ready to be impressed —
        it looks absolutely incredible from what I can see. The location seems perfect, nestled in a
        spot that looks ideal for both relaxation and exploration.
      </Typography>
      <Typography variant="body-medium" className="demo-toolbar-fab-prose">
        The cabin itself is spacious, with plenty of bedrooms and bathrooms so we can all spread out
        comfortably. The kitchen is well-equipped, perfect for whipping up some delicious meals
        together. And let's not forget the amazing outdoor area — sounds like the perfect place to
        soak up the sun, breathe in some fresh air, and unwind after a day of exploring.
      </Typography>
      <div className="demo-toolbar-fab-group">
        <Toolbar variant="floating" color="vibrant" aria-label="Message actions">
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
        <Fab color="tertiary-container" aria-label="Reply" icon={<ReplyIcon />} />
      </div>
    </div>
  );
}

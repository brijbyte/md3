import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import "@brijbyte/md3-react/button-group.css";
import { Button } from "@brijbyte/md3-react/button";
import { ButtonGroup } from "@brijbyte/md3-react/button-group";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import FormatBoldIcon from "@brijbyte/md3-icons/outlined/FormatBold";
import FormatItalicIcon from "@brijbyte/md3-icons/outlined/FormatItalic";
import FormatUnderlinedIcon from "@brijbyte/md3-icons/outlined/FormatUnderlined";
import { Row } from "./row";

export default function ButtonGroupConnectedDemo() {
  return (
    <>
      <Row label="buttons">
        <ButtonGroup variant="connected" aria-label="View">
          <Button variant="tonal">Day</Button>
          <Button variant="tonal">Week</Button>
          <Button variant="tonal">Month</Button>
        </ButtonGroup>
      </Row>
      <Row label="toggles">
        <ButtonGroup variant="connected" aria-label="Text formatting">
          <IconButton variant="tonal" aria-label="Bold" toggle defaultPressed>
            <FormatBoldIcon />
          </IconButton>
          <IconButton variant="tonal" aria-label="Italic" toggle>
            <FormatItalicIcon />
          </IconButton>
          <IconButton variant="tonal" aria-label="Underline" toggle>
            <FormatUnderlinedIcon />
          </IconButton>
        </ButtonGroup>
      </Row>
      <Row label="disabled">
        <ButtonGroup variant="connected" aria-label="Disabled group">
          <Button variant="tonal" disabled>
            One
          </Button>
          <Button variant="tonal" disabled>
            Two
          </Button>
        </ButtonGroup>
      </Row>
    </>
  );
}

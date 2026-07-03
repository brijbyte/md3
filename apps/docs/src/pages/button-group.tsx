import { Button } from "@brijbyte/md3-react/button";
import { ButtonGroup } from "@brijbyte/md3-react/button-group";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import FormatBoldIcon from "@brijbyte/md3-icons/outlined/format-bold";
import FormatItalicIcon from "@brijbyte/md3-icons/outlined/format-italic";
import FormatUnderlinedIcon from "@brijbyte/md3-icons/outlined/format-underlined";
import HeartIcon from "@brijbyte/md3-icons/outlined/favorite";
import ShareIcon from "@brijbyte/md3-icons/outlined/share";
import BookmarkIcon from "@brijbyte/md3-icons/outlined/bookmark";
import { Row, Section } from "../components/demo";

export default function ButtonGroupPage() {
  return (
    <>
      <Section title="Standard">
        <p className="mb-2 text-body-medium text-on-surface-variant">
          Related buttons with 12dp spacing; each keeps its own shape. Press and hold one — it grows
          15% wider while its neighbors compress to absorb the change.
        </p>
        <Row label="buttons">
          <ButtonGroup aria-label="Formatting">
            <Button variant="tonal">Copy</Button>
            <Button variant="tonal">Paste</Button>
            <Button variant="tonal">Delete</Button>
          </ButtonGroup>
        </Row>
        <Row label="icons">
          <ButtonGroup aria-label="Actions">
            <IconButton variant="tonal" aria-label="Favorite">
              <HeartIcon />
            </IconButton>
            <IconButton variant="tonal" aria-label="Share">
              <ShareIcon />
            </IconButton>
            <IconButton variant="tonal" aria-label="Bookmark">
              <BookmarkIcon />
            </IconButton>
          </ButtonGroup>
        </Row>
      </Section>

      <Section title="Connected">
        <p className="mb-2 text-body-medium text-on-surface-variant">
          Buttons fuse into a pill: 2dp gaps, 8dp inner corners, full outer corners. Selected
          toggles round fully; press-and-hold a toggle to see the inner corners tighten.
        </p>
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
      </Section>
    </>
  );
}

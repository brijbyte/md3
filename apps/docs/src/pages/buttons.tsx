import { Button } from "@brijbyte/md3-react/button";
import { ButtonGroup } from "@brijbyte/md3-react/button-group";
import { Fab } from "@brijbyte/md3-react/fab";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import AddIcon from "@brijbyte/md3-icons/outlined/add";
import BookmarkIcon from "@brijbyte/md3-icons/outlined/bookmark";
import EditIcon from "@brijbyte/md3-icons/outlined/edit";
import FormatBoldIcon from "@brijbyte/md3-icons/outlined/format-bold";
import FormatItalicIcon from "@brijbyte/md3-icons/outlined/format-italic";
import FormatUnderlinedIcon from "@brijbyte/md3-icons/outlined/format-underlined";
import HeartIcon from "@brijbyte/md3-icons/outlined/favorite";
import ShareIcon from "@brijbyte/md3-icons/outlined/share";
import { Row, Section } from "../components/demo";

const buttonVariants = ["filled", "tonal", "outlined", "elevated", "text"] as const;
const iconButtonVariants = ["standard", "filled", "tonal", "outlined"] as const;
const fabColors = ["primary", "secondary", "tertiary", "surface"] as const;

export default function ButtonsPage() {
  return (
    <>
      <Section title="Common buttons">
        {buttonVariants.map((variant) => (
          <Row key={variant} label={variant}>
            <Button variant={variant}>Enabled</Button>
            <Button variant={variant} icon={<AddIcon />}>
              With icon
            </Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
          </Row>
        ))}
      </Section>

      <Section title="Icon buttons">
        {iconButtonVariants.map((variant) => (
          <Row key={variant} label={variant}>
            <IconButton variant={variant} aria-label="Add">
              <AddIcon />
            </IconButton>
            <IconButton variant={variant} aria-label="Favorite" toggle>
              <HeartIcon />
            </IconButton>
            <IconButton variant={variant} aria-label="Favorite" toggle defaultPressed>
              <HeartIcon />
            </IconButton>
            <IconButton variant={variant} aria-label="Add" disabled>
              <AddIcon />
            </IconButton>
          </Row>
        ))}
        <p className="mt-2 text-body-medium text-on-surface-variant">
          The middle two of each row are toggles — click them.
        </p>
      </Section>

      <Section title="Floating action buttons">
        <Row label="sizes">
          <Fab size="small" aria-label="Add" icon={<AddIcon />} />
          <Fab aria-label="Add" icon={<AddIcon />} />
          <Fab size="large" aria-label="Add" icon={<AddIcon />} />
          <Fab icon={<EditIcon />} label="Compose" />
        </Row>
        <Row label="colors">
          {fabColors.map((color) => (
            <Fab key={color} color={color} aria-label={color} icon={<AddIcon />} />
          ))}
          <Fab lowered aria-label="Lowered" icon={<AddIcon />} />
        </Row>
      </Section>

      <Section title="Button group — standard">
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

      <Section title="Button group — connected">
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

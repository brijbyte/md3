import { IconButton } from "@brijbyte/md3-react/icon-button";
import AddIcon from "@brijbyte/md3-icons/outlined/add";
import HeartIcon from "@brijbyte/md3-icons/outlined/favorite";
import { Row, Section } from "../components/demo";

const variants = ["standard", "filled", "tonal", "outlined"] as const;

export function IconButtonsPage() {
  return (
    <Section title="Variants">
      {variants.map((variant) => (
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
  );
}

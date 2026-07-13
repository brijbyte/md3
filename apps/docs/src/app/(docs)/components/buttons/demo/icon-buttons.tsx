import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/icon-button.css";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import HeartIcon from "@brijbyte/md3-icons/outlined/Favorite";
import { Row } from "./row";

const variants = ["standard", "filled", "tonal", "outlined"] as const;

export default function IconButtonsDemo() {
  return (
    <>
      {variants.map((variant) => (
        <Row key={variant} label={variant}>
          <IconButton title={`${variant} variant`} variant={variant} aria-label="Add">
            <AddIcon />
          </IconButton>
          <IconButton
            title={`${variant} variant toggleable`}
            variant={variant}
            aria-label="Favorite"
            toggle
          >
            <HeartIcon />
          </IconButton>
          <IconButton
            title={`${variant} variant toggleable pressed`}
            variant={variant}
            aria-label="Favorite"
            toggle
            defaultPressed
          >
            <HeartIcon />
          </IconButton>
          <IconButton
            title={`${variant} variant disabled`}
            variant={variant}
            aria-label="Add"
            disabled
          >
            <AddIcon />
          </IconButton>
        </Row>
      ))}
    </>
  );
}

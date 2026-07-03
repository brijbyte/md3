import "./icon-buttons.css";

import { IconButton } from "@brijbyte/md3-react/icon-button";
import AddIcon from "@brijbyte/md3-icons/outlined/add";
import HeartIcon from "@brijbyte/md3-icons/outlined/favorite";
import { Row } from "./row";

const variants = ["standard", "filled", "tonal", "outlined"] as const;

export default function IconButtonsDemo() {
  return (
    <>
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
    </>
  );
}

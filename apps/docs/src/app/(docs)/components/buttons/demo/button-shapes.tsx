import "@brijbyte/md3-react/button.css";
import { Button } from "@brijbyte/md3-react/button";
import BookmarkIcon from "@brijbyte/md3-icons/outlined/Bookmark";
import { Row } from "./row";

const toggleVariants = ["filled", "tonal", "elevated", "outlined"] as const;

export default function ButtonShapesDemo() {
  return (
    <>
      <Row label="round">
        <Button size="medium">Press me</Button>
        <Button size="medium" variant="tonal">
          Press me
        </Button>
      </Row>
      <Row label="square">
        <Button size="medium" shape="square">
          Press me
        </Button>
        <Button size="medium" variant="tonal" shape="square">
          Press me
        </Button>
      </Row>
      <Row label="toggle">
        {toggleVariants.map((variant) => (
          <Button key={variant} variant={variant} toggle icon={<BookmarkIcon />}>
            Save
          </Button>
        ))}
      </Row>
      <Row label="selected">
        {toggleVariants.map((variant) => (
          <Button key={variant} variant={variant} toggle defaultPressed icon={<BookmarkIcon />}>
            Saved
          </Button>
        ))}
      </Row>
    </>
  );
}

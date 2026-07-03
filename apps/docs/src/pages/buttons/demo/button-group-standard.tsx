import "./button-group-standard.css";

import { Button } from "@brijbyte/md3-react/button";
import { ButtonGroup } from "@brijbyte/md3-react/button-group";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import BookmarkIcon from "@brijbyte/md3-icons/outlined/bookmark";
import HeartIcon from "@brijbyte/md3-icons/outlined/favorite";
import ShareIcon from "@brijbyte/md3-icons/outlined/share";
import { Row } from "./row";

export default function ButtonGroupStandardDemo() {
  return (
    <>
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
    </>
  );
}

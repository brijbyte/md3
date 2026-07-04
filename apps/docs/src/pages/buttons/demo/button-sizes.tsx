import "./button-sizes.css";

import { Button } from "@brijbyte/md3-react/button";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import { Row } from "./row";

const sizes = ["xsmall", "small", "medium", "large", "xlarge"] as const;

export default function ButtonSizesDemo() {
  return (
    <>
      {sizes.map((size) => (
        <Row key={size} label={size}>
          <Button size={size} icon={<EditIcon />}>
            Edit
          </Button>
          <Button size={size} variant="outlined">
            Edit
          </Button>
        </Row>
      ))}
    </>
  );
}

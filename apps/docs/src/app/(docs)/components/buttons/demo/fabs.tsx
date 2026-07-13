import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/fab.css";
import { Fab } from "@brijbyte/md3-react/fab";
import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import { Row } from "./row";

const colors = [
  "primary-container",
  "secondary-container",
  "tertiary-container",
  "primary",
  "secondary",
  "tertiary",
] as const;

export default function FabsDemo() {
  return (
    <>
      <Row label="sizes">
        <Fab aria-label="Add" icon={<AddIcon />} />
        <Fab size="medium" aria-label="Add" icon={<AddIcon />} />
        <Fab size="large" aria-label="Add" icon={<AddIcon />} />
      </Row>
      <Row label="extended">
        <Fab icon={<EditIcon />} label="Compose" />
        <Fab size="medium" icon={<EditIcon />} label="Compose" />
      </Row>
      <Row label="colors">
        {colors.map((color) => (
          <Fab key={color} color={color} aria-label={color} icon={<AddIcon />} />
        ))}
        <Fab lowered aria-label="Lowered" icon={<AddIcon />} />
      </Row>
    </>
  );
}

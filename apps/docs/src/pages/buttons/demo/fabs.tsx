import "./fabs.css";

import { Fab } from "@brijbyte/md3-react/fab";
import AddIcon from "@brijbyte/md3-icons/outlined/add";
import EditIcon from "@brijbyte/md3-icons/outlined/edit";
import { Row } from "./row";

const colors = ["primary", "secondary", "tertiary", "surface"] as const;

export default function FabsDemo() {
  return (
    <>
      <Row label="sizes">
        <Fab size="small" aria-label="Add" icon={<AddIcon />} />
        <Fab aria-label="Add" icon={<AddIcon />} />
        <Fab size="large" aria-label="Add" icon={<AddIcon />} />
        <Fab icon={<EditIcon />} label="Compose" />
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

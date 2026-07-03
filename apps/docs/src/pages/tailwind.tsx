import { Button } from "@brijbyte/md3-react/button";
import { Fab } from "@brijbyte/md3-react/fab";
import AddIcon from "@brijbyte/md3-icons/outlined/add";
import { Row, Section } from "../components/demo";

export default function TailwindPage() {
  return (
    <Section title="Utility overrides">
      <Row label="utilities">
        <Button className="rounded-lg">rounded-lg</Button>
        <Button className="bg-fuchsia-600">bg-fuchsia-600</Button>
        <Button variant="outlined" className="px-10">
          px-10
        </Button>
        <Fab
          aria-label="Squarish teal FAB"
          icon={<AddIcon />}
          className="rounded-md bg-teal-600 text-white"
        />
      </Row>
      <p className="mt-2 text-body-medium text-on-surface-variant">
        Utility classes win over component styles: the utilities layer is declared after
        md3.components, so no !important is needed.
      </p>
    </Section>
  );
}

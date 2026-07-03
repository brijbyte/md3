import { Button } from "@brijbyte/md3-react/button";
import AddIcon from "@brijbyte/md3-icons/outlined/add";
import { Row, Section } from "../components/demo";

const variants = ["filled", "tonal", "outlined", "elevated", "text"] as const;

export default function ButtonsPage() {
  return (
    <Section title="Variants">
      {variants.map((variant) => (
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
  );
}

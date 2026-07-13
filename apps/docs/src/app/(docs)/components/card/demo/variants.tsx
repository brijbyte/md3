import "@brijbyte/md3-react/card.css";
import "./variants.css";

import { Card } from "@brijbyte/md3-react/card";
import { Typography } from "@brijbyte/md3-react/typography";

const VARIANTS = [
  { variant: "elevated", blurb: "Rests at level 1 on a low surface container." },
  { variant: "filled", blurb: "Flat, on the highest surface container." },
  { variant: "outlined", blurb: "Flat surface with an outline-variant border." },
] as const;

export default function CardVariantsDemo() {
  return (
    <div className="demo-card-variants">
      {VARIANTS.map(({ variant, blurb }) => (
        <Card key={variant} variant={variant} className="demo-card-variants-card">
          <Typography as="h3" variant="title-medium" className="demo-card-variants-title">
            {variant}
          </Typography>
          <Typography variant="body-medium" className="demo-card-variants-blurb">
            {blurb}
          </Typography>
        </Card>
      ))}
    </div>
  );
}

import "./scale.css";

import { Typography, type TypographyVariant } from "@brijbyte/md3-react/typography";

const SCALE: TypographyVariant[] = [
  "display-large",
  "display-medium",
  "display-small",
  "headline-large",
  "headline-medium",
  "headline-small",
  "title-large",
  "title-medium",
  "title-small",
  "body-large",
  "body-medium",
  "body-small",
  "label-large",
  "label-medium",
  "label-small",
];

function roleName(variant: TypographyVariant) {
  return variant.replace("-", " ").replace(/^./, (c) => c.toUpperCase());
}

export default function TypeScaleDemo() {
  return (
    <div className="demo-typography-scale">
      {SCALE.map((variant) => (
        <div key={variant} className="demo-typography-scale-row">
          <Typography as="span" variant="label-medium" className="demo-typography-scale-token">
            {variant}
          </Typography>
          <Typography variant={variant}>{roleName(variant)}</Typography>
        </div>
      ))}
    </div>
  );
}

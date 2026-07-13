"use client";
import "./actionable.css";

import { useState } from "react";
import { ActionableCard } from "@brijbyte/md3-react/card";
import { Typography } from "@brijbyte/md3-react/typography";

const VARIANTS = ["elevated", "filled", "outlined"] as const;

export default function ActionableCardDemo() {
  const [clicks, setClicks] = useState(0);
  return (
    <div className="demo-card-actionable">
      <div className="demo-card-actionable-row">
        {VARIANTS.map((variant) => (
          <ActionableCard
            key={variant}
            variant={variant}
            className="demo-card-actionable-card"
            onClick={() => setClicks((n) => n + 1)}
          >
            <Typography as="h3" variant="title-medium" className="demo-card-actionable-title">
              {variant}
            </Typography>
            <Typography variant="body-medium" className="demo-card-actionable-blurb">
              Hover, focus, and press me.
            </Typography>
          </ActionableCard>
        ))}
        <ActionableCard disabled variant="elevated" className="demo-card-actionable-card">
          <Typography as="h3" variant="title-medium">
            Disabled
          </Typography>
          <Typography variant="body-medium" className="demo-card-actionable-blurb">
            Not interactive.
          </Typography>
        </ActionableCard>
      </div>
      <Typography variant="label-large">Cards clicked: {clicks}</Typography>
    </div>
  );
}

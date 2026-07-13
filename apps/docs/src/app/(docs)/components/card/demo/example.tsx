import "@brijbyte/md3-react/button.css";
import "@brijbyte/md3-react/card.css";
import "./example.css";

import { Button } from "@brijbyte/md3-react/button";
import { Card, CardMedia } from "@brijbyte/md3-react/card";
import { Typography } from "@brijbyte/md3-react/typography";
import LandscapeIcon from "@brijbyte/md3-icons/outlined/Landscape";

export default function CardExampleDemo() {
  return (
    <Card className="demo-card-example">
      <CardMedia className="demo-card-example-media" aria-hidden>
        <LandscapeIcon />
      </CardMedia>
      <div className="demo-card-example-content">
        <Typography as="h3" variant="title-large">
          Alpine loop trail
        </Typography>
        <Typography variant="body-medium" className="demo-card-example-muted">
          12 km · moderate · open year-round
        </Typography>
        <Typography variant="body-medium" className="demo-card-example-muted">
          A steady climb through larch forest to a ridge with views over both valleys. Best light in
          the early morning.
        </Typography>
        <div className="demo-card-example-actions">
          <Button variant="outlined">Share</Button>
          <Button>Book now</Button>
        </div>
      </div>
    </Card>
  );
}

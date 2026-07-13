import "@brijbyte/md3-react/divider.css";
import "./variants.css";

import { Divider } from "@brijbyte/md3-react/divider";
import { Typography } from "@brijbyte/md3-react/typography";

export default function DividerVariantsDemo() {
  return (
    <div className="demo-divider">
      <div className="demo-divider-list">
        <Typography variant="body-medium">Full-width divider</Typography>
        <Divider />
        <Typography variant="body-medium">Inset divider (leading 16dp)</Typography>
        <Divider insetStart />
        <Typography variant="body-medium">Inset both ends</Typography>
        <Divider inset />
        <Typography variant="body-medium">Trailing content</Typography>
      </div>

      <div className="demo-divider-row">
        <Typography variant="body-medium">Drafts</Typography>
        <Divider orientation="vertical" />
        <Typography variant="body-medium">Sent</Typography>
        <Divider orientation="vertical" />
        <Typography variant="body-medium">Archive</Typography>
      </div>
    </div>
  );
}

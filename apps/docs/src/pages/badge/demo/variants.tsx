import "./variants.css";

import { Badge } from "@brijbyte/md3-react/badge";

export default function BadgeVariantsDemo() {
  return (
    <div className="demo-badge-variants">
      <Badge aria-label="New notifications" />
      <Badge>3</Badge>
      <Badge>32</Badge>
      <Badge>999+</Badge>
    </div>
  );
}

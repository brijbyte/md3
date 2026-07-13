import "@brijbyte/md3-react/linear-progress.css";
import "./linear-indeterminate.css";

import { LinearProgress } from "@brijbyte/md3-react/linear-progress";

export default function LinearProgressIndeterminateDemo() {
  return (
    <div className="demo-progress-indicator-linear">
      <LinearProgress aria-label="Loading" />
      <LinearProgress aria-label="Loading" wavy />
    </div>
  );
}

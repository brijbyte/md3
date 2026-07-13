import "@brijbyte/md3-react/circular-progress.css";
import "./circular-indeterminate.css";

import { CircularProgress } from "@brijbyte/md3-react/circular-progress";

export default function CircularProgressIndeterminateDemo() {
  return (
    <div className="demo-progress-indicator-circular">
      <CircularProgress aria-label="Loading" />
      <CircularProgress aria-label="Loading" wavy />
    </div>
  );
}

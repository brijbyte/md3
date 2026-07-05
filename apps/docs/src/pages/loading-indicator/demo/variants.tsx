import "./variants.css";

import { LoadingIndicator } from "@brijbyte/md3-react/loading-indicator";

export default function LoadingIndicatorVariantsDemo() {
  return (
    <div className="demo-loading-indicator-variants">
      <LoadingIndicator aria-label="Loading" />
      <LoadingIndicator aria-label="Loading" contained />
    </div>
  );
}

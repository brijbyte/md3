import "./sizes.css";

import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import DownloadIcon from "@brijbyte/md3-icons/outlined/Download";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import PrintIcon from "@brijbyte/md3-icons/outlined/Print";
import { FabMenu, FabMenuContent, FabMenuItem, FabMenuTrigger } from "@brijbyte/md3-react/fab-menu";

export default function FabMenuSizesDemo() {
  return (
    <div className="demo-fab-menu-sizes">
      {([undefined, "medium", "large"] as const).map((size) => (
        <FabMenu key={size ?? "baseline"}>
          <FabMenuTrigger size={size} aria-label="Edit" icon={<EditIcon />} />
          <FabMenuContent>
            <FabMenuItem icon={<PrintIcon />}>Print</FabMenuItem>
            <FabMenuItem icon={<DownloadIcon />}>Download</FabMenuItem>
            <FabMenuItem icon={<ContentCopyIcon />}>Make a copy</FabMenuItem>
          </FabMenuContent>
        </FabMenu>
      ))}
    </div>
  );
}

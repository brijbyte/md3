import "./fab-positioning.css";

import { Fab } from "@brijbyte/md3-react/fab";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";

const emails = [
  ["Package delivered", "Your order #4021 arrived at the front desk."],
  ["Team standup notes", "Highlights from this morning's sync."],
  ["Weekend plans?", "Thinking of a hike on Saturday if the weather holds."],
  ["Invoice due Friday", "A friendly reminder that invoice #88 is due."],
  ["New comment on your doc", "Priya left a suggestion on the roadmap."],
  ["Flight check-in open", "Check in now for flight BB-204 to Goa."],
  ["Book club pick", "Next month we're reading The Left Hand of Darkness."],
] as const;

export default function FabPositioningDemo() {
  return (
    <div className="demo-fab-screen">
      <ul className="demo-fab-list">
        {emails.map(([subject, preview]) => (
          <li key={subject} className="demo-fab-item">
            <span className="demo-fab-subject">{subject}</span>
            <span className="demo-fab-preview">{preview}</span>
          </li>
        ))}
      </ul>
      <Fab className="demo-fab-fab" icon={<EditIcon />} label="Compose" />
    </div>
  );
}

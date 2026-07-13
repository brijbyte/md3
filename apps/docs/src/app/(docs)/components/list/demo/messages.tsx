import "@brijbyte/md3-react/list.css";
import "@brijbyte/md3-react/divider.css";
import "./messages.css";

import * as React from "react";
import { List, ListItem } from "@brijbyte/md3-react/list";
import { Divider } from "@brijbyte/md3-react/divider";

// Guidelines "Gaps & dividers": an uncontained list (no filled container) uses
// dividers between rows for separation. Leading avatars (40dp, corner-full,
// title-medium) and trailing supporting text (a timestamp) per the list spec.
function Avatar({ initials, tone }: { initials: string; tone: string }) {
  return (
    <span className="demo-msg-avatar" data-tone={tone}>
      {initials}
    </span>
  );
}

const MESSAGES = [
  {
    id: 1,
    name: "Anita Kumar",
    preview: "Ready for another review pass?",
    time: "9:41",
    initials: "AK",
    tone: "a",
  },
  {
    id: 2,
    name: "Theo Wu",
    preview: "Shipped the token rename 🎉",
    time: "8:12",
    initials: "TW",
    tone: "b",
  },
  {
    id: 3,
    name: "Maya Rao",
    preview: "Can you take the on-call swap?",
    time: "Yesterday",
    initials: "MR",
    tone: "c",
  },
  {
    id: 4,
    name: "Devs channel",
    preview: "Priya: the flaky test is fixed",
    time: "Mon",
    initials: "#",
    tone: "d",
  },
];

export default function ListMessagesDemo() {
  return (
    <List className="demo-msg-list">
      {MESSAGES.map((m, i) => (
        <React.Fragment key={m.id}>
          {i > 0 ? <Divider inset /> : null}
          <ListItem
            leading={<Avatar initials={m.initials} tone={m.tone} />}
            supportingText={m.preview}
            trailingSupportingText={m.time}
          >
            {m.name}
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
}

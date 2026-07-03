import "./badges.css";

import ChatBubbleIcon from "@brijbyte/md3-icons/outlined/chat-bubble";
import MailIcon from "@brijbyte/md3-icons/outlined/mail";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/notifications";
import { Badge } from "@brijbyte/md3-react/badge";
import { Tab, TabList, Tabs } from "@brijbyte/md3-react/tabs";

export default function BadgeInTabsDemo() {
  return (
    <div className="demo-tabs-badges">
      <Tabs defaultValue="mail">
        <TabList aria-label="Inbox (primary)">
          <Tab
            value="mail"
            icon={<MailIcon />}
            badge={<Badge>12</Badge>}
            aria-label="Mail, 12 unread"
          >
            Mail
          </Tab>
          <Tab
            value="chat"
            icon={<ChatBubbleIcon />}
            badge={<Badge />}
            aria-label="Chat, new messages"
          >
            Chat
          </Tab>
          <Tab value="alerts" icon={<NotificationsIcon />}>
            Alerts
          </Tab>
        </TabList>
      </Tabs>
      <Tabs defaultValue="mail">
        <TabList variant="secondary" aria-label="Inbox (secondary)">
          <Tab value="mail" badge={<Badge>12</Badge>} aria-label="Mail, 12 unread">
            Mail
          </Tab>
          <Tab value="chat" badge={<Badge />} aria-label="Chat, new messages">
            Chat
          </Tab>
          <Tab value="alerts">Alerts</Tab>
        </TabList>
      </Tabs>
    </div>
  );
}

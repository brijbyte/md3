"use client";
import "@brijbyte/md3-react/tabs.css";
import "@brijbyte/md3-react/badge.css";
import "./badges.css";

import * as React from "react";
import ChatBubbleIcon from "@brijbyte/md3-icons/outlined/ChatBubble";
import MailIcon from "@brijbyte/md3-icons/outlined/Mail";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import { Badge } from "@brijbyte/md3-react/badge";
import { Tab, TabList, Tabs } from "@brijbyte/md3-react/tabs";

export default function BadgeInTabsDemo() {
  const [tab, setTab] = React.useState("mail");
  return (
    <div className="demo-tabs-badges">
      <Tabs value={tab} onValueChange={setTab}>
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
      <Tabs value={tab} onValueChange={setTab}>
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

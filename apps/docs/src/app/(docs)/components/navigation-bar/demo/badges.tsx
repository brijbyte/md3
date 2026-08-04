"use client";
import "@brijbyte/md3-react/navigation-bar.css";
import "@brijbyte/md3-react/badge.css";
import "./badges.css";

import { useState } from "react";
import HomeIcon from "@brijbyte/md3-icons/outlined/Home";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import PersonIcon from "@brijbyte/md3-icons/outlined/Person";
import { Badge } from "@brijbyte/md3-react/badge";
import { NavigationBar, NavigationBarItem } from "@brijbyte/md3-react/navigation-bar";

export default function NavigationBarBadges() {
  const [active, setActive] = useState("home");
  return (
    <NavigationBar aria-label="Main" className="demo-navigation-bar-badges">
      <NavigationBarItem
        icon={<HomeIcon />}
        label="Home"
        active={active === "home"}
        onClick={() => setActive("home")}
      />
      <NavigationBarItem
        icon={<NotificationsIcon />}
        label="Alerts"
        aria-label="Alerts, 3 new notifications"
        badge={<Badge>3</Badge>}
        active={active === "alerts"}
        onClick={() => setActive("alerts")}
      />
      <NavigationBarItem
        icon={<PersonIcon />}
        label="Profile"
        badge={<Badge />}
        active={active === "profile"}
        onClick={() => setActive("profile")}
      />
    </NavigationBar>
  );
}

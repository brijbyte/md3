"use client";
import "@brijbyte/md3-react/navigation-bar.css";
import "./basic.css";

import { useState } from "react";
import ExploreIcon from "@brijbyte/md3-icons/outlined/Explore";
import HomeIcon from "@brijbyte/md3-icons/outlined/Home";
import PersonIcon from "@brijbyte/md3-icons/outlined/Person";
import SearchIcon from "@brijbyte/md3-icons/outlined/Search";
import { NavigationBar, NavigationBarItem } from "@brijbyte/md3-react/navigation-bar";

const destinations = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "explore", label: "Explore", icon: <ExploreIcon /> },
  { key: "search", label: "Search", icon: <SearchIcon /> },
  { key: "profile", label: "Profile", icon: <PersonIcon /> },
];

export default function NavigationBarBasic() {
  const [active, setActive] = useState("home");
  return (
    <NavigationBar aria-label="Main" className="demo-navigation-bar">
      {destinations.map((d) => (
        <NavigationBarItem
          key={d.key}
          icon={d.icon}
          label={d.label}
          active={active === d.key}
          onClick={() => setActive(d.key)}
        />
      ))}
    </NavigationBar>
  );
}

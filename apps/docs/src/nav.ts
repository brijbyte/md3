import type * as React from "react";
import ButtonsIcon from "@brijbyte/md3-icons/outlined/ButtonsAlt";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import CheckBoxIcon from "@brijbyte/md3-icons/outlined/CheckBox";
import HomeIcon from "@brijbyte/md3-icons/outlined/Home";
import PaletteIcon from "@brijbyte/md3-icons/outlined/Palette";
import RadioIcon from "@brijbyte/md3-icons/outlined/RadioButtonChecked";
import RocketLaunchIcon from "@brijbyte/md3-icons/outlined/RocketLaunch";
import TabIcon from "@brijbyte/md3-icons/outlined/Tab";
import ToggleOnIcon from "@brijbyte/md3-icons/outlined/ToggleOn";

export type NavItem = {
  // Slashless route ("/components/buttons"); SSG writes it as `<path>/index.html`.
  path: string;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type NavSection = { label: string; items: NavItem[] };

// Landing page: rendered without the docs sidebar (see Root.tsx).
export const HOME: NavItem = {
  path: "/",
  label: "Overview",
  title: "MD3 React",
  description: "Material Design 3 components for React, built on Base UI.",
  icon: HomeIcon,
};

// Sidebar sections; routes are /<section>/<page>.
export const SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        path: "/overview/getting-started",
        label: "Getting started",
        title: "Getting started",
        description: "Install the library, load the styles, and render your first component.",
        icon: RocketLaunchIcon,
      },
      {
        path: "/overview/tailwind",
        label: "Tailwind integration",
        title: "Tailwind integration",
        description: "MD3 tokens as Tailwind utilities, and utility overrides without !important.",
        icon: PaletteIcon,
      },
    ],
  },
  {
    label: "Components",
    items: [
      {
        path: "/components/buttons",
        label: "Buttons",
        title: "Buttons",
        description: "Common buttons, icon buttons, FABs, and button groups.",
        icon: ButtonsIcon,
      },
      {
        path: "/components/badge",
        label: "Badge",
        title: "Badge",
        description: "Badges show notifications, counts, or status information.",
        icon: NotificationsIcon,
      },
      {
        path: "/components/checkbox",
        label: "Checkbox",
        title: "Checkbox",
        description: "Checkboxes let users select one or more items, or toggle an item.",
        icon: CheckBoxIcon,
      },
      {
        path: "/components/radio",
        label: "Radio",
        title: "Radio button",
        description: "Radio buttons let people select one option from a set.",
        icon: RadioIcon,
      },
      {
        path: "/components/switch",
        label: "Switch",
        title: "Switch",
        description: "Switches toggle the state of a single item on or off.",
        icon: ToggleOnIcon,
      },
      {
        path: "/components/tabs",
        label: "Tabs",
        title: "Tabs",
        description: "Tabs organize content across different screens and views.",
        icon: TabIcon,
      },
    ],
  },
];

// Flat route list (landing first) for lookup, SSG paths, and landing cards.
export const NAV: NavItem[] = [HOME, ...SECTIONS.flatMap((section) => section.items)];

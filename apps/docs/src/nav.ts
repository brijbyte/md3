import type * as React from "react";
import BottomSheetsIcon from "@brijbyte/md3-icons/outlined/BottomSheets";
import ButtonsIcon from "@brijbyte/md3-icons/outlined/ButtonsAlt";
import FormatSizeIcon from "@brijbyte/md3-icons/outlined/FormatSize";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import CampaignIcon from "@brijbyte/md3-icons/outlined/Campaign";
import CardsIcon from "@brijbyte/md3-icons/outlined/Cards";
import CheckBoxIcon from "@brijbyte/md3-icons/outlined/CheckBox";
import ChipsIcon from "@brijbyte/md3-icons/outlined/Chips";
import HomeIcon from "@brijbyte/md3-icons/outlined/Home";
import MenuIcon from "@brijbyte/md3-icons/outlined/Menu";
import PaletteIcon from "@brijbyte/md3-icons/outlined/Palette";
import DonutLargeIcon from "@brijbyte/md3-icons/outlined/DonutLarge";
import ProgressActivityIcon from "@brijbyte/md3-icons/outlined/ProgressActivity";
import RadioIcon from "@brijbyte/md3-icons/outlined/RadioButtonChecked";
import RightPanelOpenIcon from "@brijbyte/md3-icons/outlined/RightPanelOpen";
import RocketLaunchIcon from "@brijbyte/md3-icons/outlined/RocketLaunch";
import SlidersIcon from "@brijbyte/md3-icons/outlined/Sliders";
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
  description: "Spec-accurate Material Design 3 components for React — accessible by default.",
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
        description: "From npm install to your first rendered component, in five minutes.",
        icon: RocketLaunchIcon,
      },
      {
        path: "/overview/integration",
        label: "Integration",
        title: "Integration",
        description: "Wire MD3 tokens into your Tailwind build without fighting the cascade.",
        icon: PaletteIcon,
      },
    ],
  },
  {
    label: "Styles",
    items: [
      {
        path: "/styles/typography",
        label: "Typography",
        title: "Typography",
        description: "One component, fifteen type roles — change the tag, keep the scale.",
        icon: FormatSizeIcon,
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
        description: "Five button families sharing one state layer and ripple, filled to FAB.",
        icon: ButtonsIcon,
      },
      {
        path: "/components/badge",
        label: "Badge",
        title: "Badge",
        description: "Surface a count or status without stealing focus from the icon under it.",
        icon: NotificationsIcon,
      },
      {
        path: "/components/bottom-sheet",
        label: "Bottom sheet",
        title: "Bottom sheet",
        description: "A modal surface anchored to the bottom edge, dismissed by drag or scrim.",
        icon: BottomSheetsIcon,
      },
      {
        path: "/components/side-sheet",
        label: "Side sheet",
        title: "Side sheet",
        description: "A surface anchored to a screen edge for supplementary content or tasks.",
        icon: RightPanelOpenIcon,
      },
      {
        path: "/components/card",
        label: "Card",
        title: "Card",
        description: "A bare, unopinionated container — you own the layout inside it.",
        icon: CardsIcon,
      },
      {
        path: "/components/chips",
        label: "Chips",
        title: "Chips",
        description: "Input, selection, and filtering in one compact control, four ways.",
        icon: ChipsIcon,
      },
      {
        path: "/components/checkbox",
        label: "Checkbox",
        title: "Checkbox",
        description: "Multi-select done properly — indeterminate state included.",
        icon: CheckBoxIcon,
      },
      {
        path: "/components/loading-indicator",
        label: "Loading indicator",
        title: "Loading indicator",
        description: "A shape-morphing spinner straight out of Compose — no spinning arc here.",
        icon: ProgressActivityIcon,
      },
      {
        path: "/components/progress-indicator",
        label: "Progress indicator",
        title: "Progress indicator",
        description: "Linear and circular progress, including the new wavy variants.",
        icon: DonutLargeIcon,
      },
      {
        path: "/components/menu",
        label: "Menu",
        title: "Menu",
        description: "Dropdowns, submenus, and radio/checkbox items, built on Base UI Menu.",
        icon: MenuIcon,
      },
      {
        path: "/components/radio",
        label: "Radio",
        title: "Radio button",
        description: "Single-select groups with the state layer and motion MD3 expects.",
        icon: RadioIcon,
      },
      {
        path: "/components/slider",
        label: "Slider",
        title: "Slider",
        description: "Continuous, discrete, centered, or range — five sizes, spec-exact.",
        icon: SlidersIcon,
      },
      {
        path: "/components/snackbar",
        label: "Snackbar",
        title: "Snackbar",
        description: "Brief, dismissable feedback that never steals the user's place.",
        icon: CampaignIcon,
      },
      {
        path: "/components/switch",
        label: "Switch",
        title: "Switch",
        description: "An on/off toggle with the icon-swap and thumb motion MD3 specifies.",
        icon: ToggleOnIcon,
      },
      {
        path: "/components/tabs",
        label: "Tabs",
        title: "Tabs",
        description: "Primary and secondary tabs with the indicator animation built in.",
        icon: TabIcon,
      },
    ],
  },
];

// Flat route list (landing first) for lookup, SSG paths, and landing cards.
export const NAV: NavItem[] = [HOME, ...SECTIONS.flatMap((section) => section.items)];

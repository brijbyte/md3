import type * as React from "react";
import BottomSheetsIcon from "@brijbyte/md3-icons/outlined/BottomSheets";
import ButtonsIcon from "@brijbyte/md3-icons/outlined/ButtonsAlt";
import FormatSizeIcon from "@brijbyte/md3-icons/outlined/FormatSize";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import CampaignIcon from "@brijbyte/md3-icons/outlined/Campaign";
import CelebrationIcon from "@brijbyte/md3-icons/outlined/Celebration";
import CardsIcon from "@brijbyte/md3-icons/outlined/Cards";
import CheckBoxIcon from "@brijbyte/md3-icons/outlined/CheckBox";
import ChipsIcon from "@brijbyte/md3-icons/outlined/Chips";
import CategoryIcon from "@brijbyte/md3-icons/outlined/Category";
import ChecklistIcon from "@brijbyte/md3-icons/outlined/Checklist";
import DialogsIcon from "@brijbyte/md3-icons/outlined/Dialogs";
import HorizontalRuleIcon from "@brijbyte/md3-icons/outlined/HorizontalRule";
import ListsIcon from "@brijbyte/md3-icons/outlined/Lists";
import HomeIcon from "@brijbyte/md3-icons/outlined/Home";
import MenuIcon from "@brijbyte/md3-icons/outlined/Menu";
import PaletteIcon from "@brijbyte/md3-icons/outlined/Palette";
import DonutLargeIcon from "@brijbyte/md3-icons/outlined/DonutLarge";
import ProgressActivityIcon from "@brijbyte/md3-icons/outlined/ProgressActivity";
import RadioIcon from "@brijbyte/md3-icons/outlined/RadioButtonChecked";
import RightPanelOpenIcon from "@brijbyte/md3-icons/outlined/RightPanelOpen";
import DropdownMenuIcon from "@brijbyte/md3-icons/outlined/DropdownMenu";
import RocketLaunchIcon from "@brijbyte/md3-icons/outlined/RocketLaunch";
import SlidersIcon from "@brijbyte/md3-icons/outlined/Sliders";
import TabIcon from "@brijbyte/md3-icons/outlined/Tab";
import TextFieldsIcon from "@brijbyte/md3-icons/outlined/TextFields";
import ToggleOnIcon from "@brijbyte/md3-icons/outlined/ToggleOn";
import AutoAwesomeMotionIcon from "@brijbyte/md3-icons/outlined/AutoAwesomeMotion";
import AnimationIcon from "@brijbyte/md3-icons/outlined/Animation";
import BottomAppBarIcon from "@brijbyte/md3-icons/outlined/BottomAppBar";
import TooltipIcon from "@brijbyte/md3-icons/outlined/Tooltip";

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
      {
        path: "/styles/motion",
        label: "Motion",
        title: "Motion",
        description: "MD3 easing and duration tokens — the same curves the components move on.",
        icon: AnimationIcon,
      },
      {
        path: "/icons",
        label: "Icons",
        title: "Icons",
        description: "Browse all 4,000+ Material Symbols — search, switch style, copy the import.",
        icon: CategoryIcon,
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
        path: "/components/dialog",
        label: "Dialog",
        title: "Dialog",
        description: "Interrupt with intent — confirmations and focused tasks over a scrim.",
        icon: DialogsIcon,
      },
      {
        path: "/components/divider",
        label: "Divider",
        title: "Divider",
        description:
          "A one-pixel line that separates content into groups — horizontal or vertical.",
        icon: HorizontalRuleIcon,
      },
      {
        path: "/components/fab-menu",
        label: "FAB menu",
        title: "FAB menu",
        description: "A FAB that morphs into a close button and fans out related actions.",
        icon: AutoAwesomeMotionIcon,
      },
      {
        path: "/components/list",
        label: "List",
        title: "List",
        description:
          "Rows of one to three lines with leading and trailing slots, static or clickable.",
        icon: ListsIcon,
      },
      {
        path: "/components/loading-indicator",
        label: "Loading Indicator",
        title: "Loading Indicator",
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
        path: "/components/select",
        label: "Select",
        title: "Select",
        description: "A text-field-shaped trigger opening a menu of options — MD3's dropdown.",
        icon: DropdownMenuIcon,
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
      {
        path: "/components/text-field",
        label: "Text field",
        title: "Text field",
        description: "Filled and outlined fields with a floating label, icons, and errors.",
        icon: TextFieldsIcon,
      },
      {
        path: "/components/toolbar",
        label: "Toolbar",
        title: "Toolbar",
        description: "Docked bars and floating pills that keep key actions in reach.",
        icon: BottomAppBarIcon,
      },
      {
        path: "/components/tooltip",
        label: "Tooltip",
        title: "Tooltip",
        description: "Plain and rich tooltips, built on Base UI Tooltip and PreviewCard.",
        icon: TooltipIcon,
      },
    ],
  },
];

// Full-app examples combining many components; rendered standalone (no docs
// chrome) in the (showcase) route group with a corner FAB menu for theme.
export const SHOWCASES: NavItem[] = [
  {
    path: "/showcase/team-tasks",
    label: "Team Tasks",
    title: "Team Tasks",
    description: "A task-tracking dashboard built from most of the component library.",
    icon: ChecklistIcon,
  },
  {
    path: "/showcase/funky",
    label: "Funk Station",
    title: "Funk Station",
    description:
      "One CSS file reskins the library — tokens set the vibe, stable class names do the rest.",
    icon: CelebrationIcon,
  },
];

// Flat route list (landing first) for lookup, SSG paths, and landing cards.
export const NAV: NavItem[] = [HOME, ...SECTIONS.flatMap((section) => section.items), ...SHOWCASES];

// Next.js Metadata for a route (title flows through the root layout's
// "%s — MD3 React" template; the landing page uses the root default).
export function routeMetadata(path: string): { title: string; description: string } {
  const item = NAV.find((i) => i.path === path);
  if (!item) throw new Error(`routeMetadata: unknown route "${path}"`);
  return { title: item.title, description: item.description };
}

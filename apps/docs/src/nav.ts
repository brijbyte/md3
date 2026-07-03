import type * as React from "react";
import AddCircleIcon from "@brijbyte/md3-icons/outlined/add-circle";
import AppsIcon from "@brijbyte/md3-icons/outlined/apps";
import ButtonsIcon from "@brijbyte/md3-icons/outlined/buttons-alt";
import CheckBoxIcon from "@brijbyte/md3-icons/outlined/check-box";
import HomeIcon from "@brijbyte/md3-icons/outlined/home";
import PaletteIcon from "@brijbyte/md3-icons/outlined/palette";
import RadioIcon from "@brijbyte/md3-icons/outlined/radio-button-checked";
import ToggleOnIcon from "@brijbyte/md3-icons/outlined/toggle-on";

export type NavItem = {
  // Slashless route ("/buttons"); SSG writes it as `<path>/index.html`.
  path: string;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const NAV: NavItem[] = [
  {
    path: "/",
    label: "Overview",
    title: "MD3 React",
    description: "Material Design 3 components for React, built on Base UI.",
    icon: HomeIcon,
  },
  {
    path: "/buttons",
    label: "Buttons",
    title: "Buttons",
    description: "Common buttons prompt most actions in a UI, in five variants.",
    icon: ButtonsIcon,
  },
  {
    path: "/icon-buttons",
    label: "Icon buttons",
    title: "Icon buttons",
    description: "Icon buttons help people take minor actions with one tap.",
    icon: AppsIcon,
  },
  {
    path: "/fab",
    label: "FAB",
    title: "Floating action button",
    description: "FABs represent the most important action on a screen.",
    icon: AddCircleIcon,
  },
  {
    path: "/checkbox",
    label: "Checkbox",
    title: "Checkbox",
    description: "Checkboxes let users select one or more items, or toggle an item.",
    icon: CheckBoxIcon,
  },
  {
    path: "/radio",
    label: "Radio",
    title: "Radio button",
    description: "Radio buttons let people select one option from a set.",
    icon: RadioIcon,
  },
  {
    path: "/switch",
    label: "Switch",
    title: "Switch",
    description: "Switches toggle the state of a single item on or off.",
    icon: ToggleOnIcon,
  },
  {
    path: "/tailwind",
    label: "Tailwind",
    title: "Tailwind overrides",
    description: "Unlayered utility classes win over component styles — no !important.",
    icon: PaletteIcon,
  },
];

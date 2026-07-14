import type * as React from "react";
import Link from "next/link";
import { ActionableCard, Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { IconButton } from "@/ui/icon-button";
import { Fab } from "@/ui/fab";
import { TextField } from "@/ui/text-field";
import { Checkbox } from "@/ui/checkbox";
import { Radio, RadioGroup } from "@/ui/radio";
import { Switch } from "@/ui/switch";
import { Slider } from "@/ui/slider";
import { AssistChip, FilterChip } from "@/ui/chip";
import { LinearProgress } from "@/ui/linear-progress";
import { LoadingIndicator } from "@/ui/loading-indicator";
import { Badge } from "@/ui/badge";
import { List, ListItem } from "@/ui/list";
import { Typography } from "@/ui/typography";
import ArrowForwardIcon from "@brijbyte/md3-icons/outlined/ArrowForward";
import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import FavoriteIcon from "@brijbyte/md3-icons/outlined/Favorite";
import EditIcon from "@brijbyte/md3-icons/outlined/Edit";
import VolumeUpIcon from "@brijbyte/md3-icons/outlined/VolumeUp";
import CalendarTodayIcon from "@brijbyte/md3-icons/outlined/CalendarToday";
import PetsIcon from "@brijbyte/md3-icons/outlined/Pets";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import ContentCutIcon from "@brijbyte/md3-icons/outlined/ContentCut";
import ContentCopyIcon from "@brijbyte/md3-icons/outlined/ContentCopy";
import ContentPasteIcon from "@brijbyte/md3-icons/outlined/ContentPaste";
import { SECTIONS, SHOWCASES, type NavItem } from "@/nav";

type PreviewCardProps = {
  href: string;
  title: string;
  caption: string;
  children: React.ReactNode;
};

// Ariakit-style preview card: a live (but inert) collage of real components
// above the category title. `inert` keeps the card link the only tab stop.
function PreviewCard({ href, title, caption, children }: PreviewCardProps) {
  return (
    <ActionableCard
      render={<Link href={href} />}
      nativeButton={false}
      className="flex flex-col overflow-hidden"
    >
      <div
        inert
        aria-hidden
        className="pointer-events-none flex h-56 select-none items-center justify-center overflow-hidden px-6 pt-6"
      >
        {children}
      </div>
      <div className="flex flex-col gap-1 p-6">
        <Typography as="span" variant="title-large" className="font-bold">
          {title}
        </Typography>
        <Typography as="span" variant="body-medium" className="text-on-surface-variant">
          {caption}
        </Typography>
      </div>
    </ActionableCard>
  );
}

function ButtonsPreview() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <Button>Filled</Button>
        <Button variant="tonal">Tonal</Button>
        <Button variant="outlined">Outlined</Button>
      </div>
      <div className="flex items-center gap-3">
        <IconButton variant="filled" aria-label="Add">
          <AddIcon />
        </IconButton>
        <IconButton variant="tonal" toggle aria-label="Favorite">
          <FavoriteIcon />
        </IconButton>
        <IconButton variant="outlined" aria-label="Edit">
          <EditIcon />
        </IconButton>
        <Fab icon={<EditIcon />} label="Compose" />
      </div>
    </div>
  );
}

function FormsPreview() {
  return (
    <div className="flex w-full max-w-64 flex-col gap-4">
      <TextField variant="outlined" label="Display name" defaultValue="Ada Lovelace" />
      <div className="flex items-center justify-between px-1">
        <Checkbox defaultChecked aria-label="Checked" />
        <RadioGroup defaultValue="a" className="flex items-center gap-2">
          <Radio value="a" aria-label="Selected" />
          <Radio value="b" aria-label="Unselected" />
        </RadioGroup>
        <Switch defaultChecked aria-label="On" />
      </div>
      <Slider defaultValue={60} aria-label="Volume" icon={<VolumeUpIcon />} />
    </div>
  );
}

function ChipsPreview() {
  return (
    <div className="flex max-w-72 flex-wrap justify-center gap-2">
      <FilterChip defaultPressed>Washer / dryer</FilterChip>
      <FilterChip>Elevator</FilterChip>
      <FilterChip defaultPressed icon={<PetsIcon />}>
        Pet friendly
      </FilterChip>
      <AssistChip icon={<CalendarTodayIcon />}>Set reminder</AssistChip>
      <AssistChip elevated icon={<EditIcon />}>
        Edit listing
      </AssistChip>
    </div>
  );
}

function MenusPreview() {
  return (
    <Card className="w-56 py-2">
      <List>
        <ListItem leading={<ContentCutIcon />} interactive>
          Cut
        </ListItem>
        <ListItem leading={<ContentCopyIcon />} interactive selected>
          Copy
        </ListItem>
        <ListItem leading={<ContentPasteIcon />} interactive>
          Paste
        </ListItem>
      </List>
    </Card>
  );
}

function FeedbackPreview() {
  return (
    <div className="flex w-full max-w-64 flex-col items-center gap-6">
      <LinearProgress value={65} wavy aria-label="Progress" className="w-full" />
      <div className="flex items-center gap-5">
        <LoadingIndicator aria-label="Loading" />
        <IconButton aria-label="Notifications">
          <span className="relative inline-flex">
            <NotificationsIcon />
            <Badge className="absolute -inset-e-1 -top-1">3</Badge>
          </span>
        </IconButton>
        <LoadingIndicator contained aria-label="Loading" />
      </div>
    </div>
  );
}

function IconsPreview() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <Typography as="span" variant="display-large" className="font-bold text-primary">
        4,000+
      </Typography>
      <Typography as="span" variant="title-medium" className="text-on-surface-variant">
        Material Symbols
      </Typography>
    </div>
  );
}

const PREVIEWS: (Omit<PreviewCardProps, "children"> & { preview: React.ReactNode })[] = [
  {
    href: "/components/buttons",
    title: "Buttons",
    caption: "Button, Icon button, FAB, Split button, Button group",
    preview: <ButtonsPreview />,
  },
  {
    href: "/components/text-field",
    title: "Forms",
    caption: "Text field, Checkbox, Radio, Switch, Slider",
    preview: <FormsPreview />,
  },
  {
    href: "/components/chips",
    title: "Chips",
    caption: "Assist, filter, input, and suggestion chips",
    preview: <ChipsPreview />,
  },
  {
    href: "/components/menu",
    title: "Menus & lists",
    caption: "Menu, Select, List, Tooltip",
    preview: <MenusPreview />,
  },
  {
    href: "/components/progress-indicator",
    title: "Feedback",
    caption: "Progress indicator, Loading indicator, Badge, Snackbar",
    preview: <FeedbackPreview />,
  },
  {
    href: "/styles/icons",
    title: "Icons",
    caption: "Every Material Symbol as its own React component",
    preview: <IconsPreview />,
  },
];

function ChipCloud({ items }: { items: NavItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <AssistChip
          key={item.path}
          render={<Link href={item.path} />}
          nativeButton={false}
          icon={<item.icon />}
        >
          {item.label}
        </AssistChip>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-3xl pt-10 text-center">
        <Typography
          as="h1"
          variant="display-large"
          className="font-bold text-display-medium md:text-display-large"
        >
          Material Design 3,
          <br className="hidden md:inline" />{" "}
          <span className="text-primary">built right for React</span>
        </Typography>
        <Typography variant="title-large" className="mt-6 text-on-surface-variant">
          Every component matches Google's own{" "}
          <span className="underline decoration-primary decoration-2 underline-offset-4">
            Compose Material3
          </span>{" "}
          implementation — spacing, motion, and all. Accessibility and keyboard handling come from{" "}
          <span className="underline decoration-tertiary decoration-2 underline-offset-4">
            Base UI
          </span>
          , so you get it right for free.
        </Typography>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button render={<Link href="/overview/getting-started" />} nativeButton={false}>
            Get started
          </Button>
          <Button
            variant="text"
            render={<Link href="/components/buttons" />}
            nativeButton={false}
            icon={<ArrowForwardIcon />}
          >
            Explore components
          </Button>
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PREVIEWS.map(({ preview, ...card }) => (
          <PreviewCard key={card.href} {...card}>
            {preview}
          </PreviewCard>
        ))}
      </section>

      <section className="mt-16">
        <Typography as="h2" variant="headline-small" className="font-bold">
          Everything in the box
        </Typography>
        <div className="mt-6 flex flex-col gap-6">
          {SECTIONS.map((section) => (
            <div key={section.label} className="flex flex-col gap-3">
              <Typography
                as="h3"
                variant="label-large"
                className="uppercase tracking-wide text-on-surface-variant"
              >
                {section.label}
              </Typography>
              <ChipCloud items={section.items} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <Typography as="h2" variant="headline-small" className="font-bold">
          Showcases
        </Typography>
        <Typography variant="body-medium" className="mt-1 text-on-surface-variant">
          Full example apps built from the component library.
        </Typography>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SHOWCASES.map((item) => (
            <ActionableCard
              key={item.path}
              render={<Link href={item.path} />}
              nativeButton={false}
              className="flex flex-col gap-3 p-6"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary-container text-2xl text-on-secondary-container">
                <item.icon />
              </span>
              <Typography as="span" variant="title-large" className="font-bold">
                {item.label}
              </Typography>
              <Typography as="span" variant="body-medium" className="text-on-surface-variant">
                {item.description}
              </Typography>
            </ActionableCard>
          ))}
        </div>
      </section>
    </>
  );
}

import * as React from "react";
import { Button } from "@brijbyte/md3-react/button";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Fab } from "@brijbyte/md3-react/fab";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Switch } from "@brijbyte/md3-react/switch";
import PlusIcon from "@brijbyte/md3-icons/outlined/add";
import HeartIcon from "@brijbyte/md3-icons/outlined/favorite";
import MoonIcon from "@brijbyte/md3-icons/outlined/dark-mode";
import SunIcon from "@brijbyte/md3-icons/outlined/light-mode";

const buttonVariants = ["filled", "tonal", "outlined", "elevated", "text"] as const;
const iconButtonVariants = ["standard", "filled", "tonal", "outlined"] as const;
const fabColors = ["primary", "secondary", "tertiary", "surface"] as const;

type Theme = "light" | "dark";

function useTheme() {
  // index.html sets data-theme before paint from localStorage / OS preference.
  const [theme, setTheme] = React.useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return [theme, setTheme] as const;
}

export function App() {
  const [theme, setTheme] = useTheme();

  return (
    <div className="mx-auto max-w-230 px-6 pt-8 pb-24">
      <header className="flex items-center justify-between gap-4 pt-4 pb-10">
        <div>
          <h1 className="font-brand text-headline-medium">MD3 React</h1>
          <p className="text-body-medium text-on-surface-variant">
            Material Design 3 components for React, built on Base UI.
          </p>
        </div>
        <IconButton
          variant="tonal"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </IconButton>
      </header>

      <Section title="Common buttons">
        {buttonVariants.map((variant) => (
          <Row key={variant} label={variant}>
            <Button variant={variant}>Enabled</Button>
            <Button variant={variant} icon={<PlusIcon />}>
              With icon
            </Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
          </Row>
        ))}
      </Section>

      <Section title="Icon buttons">
        {iconButtonVariants.map((variant) => (
          <Row key={variant} label={variant}>
            <IconButton variant={variant} aria-label="Add">
              <PlusIcon />
            </IconButton>
            <IconButton variant={variant} aria-label="Favorite" toggle>
              <HeartIcon />
            </IconButton>
            <IconButton variant={variant} aria-label="Favorite" toggle defaultPressed>
              <HeartIcon />
            </IconButton>
            <IconButton variant={variant} aria-label="Add" disabled>
              <PlusIcon />
            </IconButton>
          </Row>
        ))}
        <p className="mt-2 text-body-medium text-on-surface-variant">
          The middle two of each row are toggles — click them.
        </p>
      </Section>

      <Section title="FAB">
        <Row label="sizes">
          <Fab size="small" aria-label="Add" icon={<PlusIcon />} />
          <Fab aria-label="Add" icon={<PlusIcon />} />
          <Fab size="large" aria-label="Add" icon={<PlusIcon />} />
          <Fab icon={<PlusIcon />} label="Compose" />
        </Row>
        <Row label="colors">
          {fabColors.map((color) => (
            <Fab key={color} color={color} aria-label={color} icon={<PlusIcon />} />
          ))}
          <Fab lowered aria-label="Lowered" icon={<PlusIcon />} />
        </Row>
      </Section>

      <Section title="Checkbox">
        <Row label="states">
          <Checkbox aria-label="Unchecked" />
          <Checkbox aria-label="Checked" defaultChecked />
          <Checkbox aria-label="Indeterminate" indeterminate />
          <Checkbox aria-label="Disabled" disabled />
          <Checkbox aria-label="Disabled checked" disabled defaultChecked />
        </Row>
      </Section>

      <Section title="Radio">
        <Row label="group">
          <RadioGroup defaultValue="a" className="flex gap-2">
            <Radio value="a" aria-label="Option A" />
            <Radio value="b" aria-label="Option B" />
            <Radio value="c" aria-label="Option C" disabled />
          </RadioGroup>
        </Row>
        <Row label="disabled">
          <RadioGroup defaultValue="a" disabled className="flex gap-2">
            <Radio value="a" aria-label="Disabled selected" />
            <Radio value="b" aria-label="Disabled unselected" />
          </RadioGroup>
        </Row>
      </Section>

      <Section title="Tailwind overrides">
        <Row label="utilities">
          <Button className="rounded-lg">rounded-lg</Button>
          <Button className="bg-fuchsia-600">bg-fuchsia-600</Button>
          <Button variant="outlined" className="px-10">
            px-10
          </Button>
          <Fab
            aria-label="Squarish teal FAB"
            icon={<PlusIcon />}
            className="rounded-md bg-teal-600 text-white"
          />
        </Row>
        <p className="mt-2 text-body-medium text-on-surface-variant">
          Utility classes win over component styles: the utilities layer is declared after
          md3.components, so no !important is needed.
        </p>
      </Section>

      <Section title="Switch">
        <Row label="states">
          <Switch aria-label="Off" />
          <Switch aria-label="On" defaultChecked />
          <Switch aria-label="Disabled off" disabled />
          <Switch aria-label="Disabled on" disabled defaultChecked />
        </Row>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-extra-large bg-surface-container-low px-7 pt-6 pb-7">
      <h2 className="mb-2 font-brand text-title-large">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3">
      <span className="w-22.5 shrink-0 text-label-large text-on-surface-variant capitalize">
        {label}
      </span>
      {children}
    </div>
  );
}

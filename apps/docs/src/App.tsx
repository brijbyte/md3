import * as React from "react";
import { Button, Checkbox, Fab, IconButton, Radio, RadioGroup, Switch } from "@brijbyte/md3-react";

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
    <div className="app">
      <header className="app-header">
        <div>
          <h1 className="app-title">MD3 React</h1>
          <p className="app-subtitle">Material Design 3 components for React, built on Base UI.</p>
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
        <p className="hint">The middle two of each row are toggles — click them.</p>
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
          <RadioGroup defaultValue="a" style={{ display: "flex", gap: 8 }}>
            <Radio value="a" aria-label="Option A" />
            <Radio value="b" aria-label="Option B" />
            <Radio value="c" aria-label="Option C" disabled />
          </RadioGroup>
        </Row>
        <Row label="disabled">
          <RadioGroup defaultValue="a" disabled style={{ display: "flex", gap: 8 }}>
            <Radio value="a" aria-label="Disabled selected" />
            <Radio value="b" aria-label="Disabled unselected" />
          </RadioGroup>
        </Row>
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
    <section className="section">
      <h2 className="section-title">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      {children}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 21q-3.75 0-6.375-2.625T3 12q0-3.75 2.625-6.375T12 3q.35 0 .688.025t.662.075q-1.025.725-1.638 1.888T11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q1.375 0 2.525-.613T20.9 10.65q.05.325.075.662T21 12q0 3.75-2.625 6.375T12 21Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 17q-2.075 0-3.538-1.463T7 12q0-2.075 1.463-3.538T12 7q2.075 0 3.538 1.463T17 12q0 2.075-1.463 3.538T12 17ZM2 13q-.425 0-.713-.288T1 12q0-.425.288-.713T2 11h2q.425 0 .713.288T5 12q0 .425-.288.713T4 13H2Zm18 0q-.425 0-.713-.288T19 12q0-.425.288-.713T20 11h2q.425 0 .713.288T23 12q0 .425-.288.713T22 13h-2Zm-8-8q-.425 0-.713-.288T11 4V2q0-.425.288-.713T12 1q.425 0 .713.288T13 2v2q0 .425-.288.713T12 5Zm0 18q-.425 0-.713-.288T11 22v-2q0-.425.288-.713T12 19q.425 0 .713.288T13 20v2q0 .425-.288.713T12 23ZM5.65 7.05 4.575 6q-.3-.275-.288-.7t.288-.725q.3-.3.725-.3t.7.3L7.05 5.65q.275.3.275.7t-.275.7q-.275.3-.687.288t-.713-.288Zm12.7 12.725L17.3 18.7q-.275-.3-.275-.712t.275-.688q.275-.3.688-.287t.712.287L19.775 18q.3.275.288.7t-.288.725q-.3.3-.725.3t-.7-.3ZM16.95 7.05q-.3-.275-.288-.687t.288-.713L18 4.575q.275-.3.7-.288t.725.288q.3.3.3.725t-.3.7L18.35 7.05q-.3.275-.7.275t-.7-.275ZM4.575 19.425q-.3-.3-.3-.725t.3-.7l1.075-1.075q.3-.275.713-.275t.687.275q.3.275.288.688t-.288.712L6 19.425q-.275.3-.7.288t-.725-.288Z" />
    </svg>
  );
}

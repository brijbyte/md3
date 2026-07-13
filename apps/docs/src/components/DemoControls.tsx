"use client";
import "./DemoControls.css";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { TooltipProvider } from "@/ui/tooltip";
import * as React from "react";
import { Typography } from "@brijbyte/md3-react/typography";

// Per-demo playground overrides: theme follows the docs toggle until overridden
// (null), direction defaults to ltr. State lives here so the buttons (in the
// code tabs) and the surface (the playground div) can sit apart in the tree.
type DemoTheme = "light" | "dark" | null;
type DemoDir = "ltr" | "rtl";

const DemoControlsContext = React.createContext<{
  theme: DemoTheme;
  dir: DemoDir;
  toggleTheme: () => void;
  toggleDir: () => void;
} | null>(null);

export function useDemoControls() {
  const context = React.useContext(DemoControlsContext);
  if (!context) throw new Error("useDemoControls must be used within a Demo");
  return context;
}

export function DemoControlsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<DemoTheme>(null);
  const [dir, setDir] = React.useState<DemoDir>("ltr");

  const value = React.useMemo(
    () => ({
      theme,
      dir,
      // First toggle flips against the docs-level theme (client-only, so the
      // document is always there); after that it alternates the override.
      toggleTheme: () =>
        setTheme((prev) => {
          const effective =
            prev ?? (document.documentElement.dataset.theme === "light" ? "light" : "dark");
          return effective === "light" ? "dark" : "light";
        }),
      toggleDir: () => setDir((prev) => (prev === "ltr" ? "rtl" : "ltr")),
    }),
    [theme, dir],
  );

  return (
    <DemoControlsContext.Provider value={value}>
      <DirectionProvider direction={dir}>
        <TooltipProvider delay={500}>{children}</TooltipProvider>
      </DirectionProvider>
    </DemoControlsContext.Provider>
  );
}

// Tracks the docs color theme so a theme-overridden surface still matches the
// [data-theme][data-color-theme] token selectors (they need both attributes on
// one element). Server snapshot is null — overrides only exist post-hydration.
function useDocsColorTheme() {
  return React.useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-color-theme"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.dataset.colorTheme ?? null,
    () => null,
  );
}

// The .demo-surface div (DemoControls.css): `all: initial` exempts custom properties,
// direction and unicode-bidi, so the tokens re-declared by data-theme and the
// dir attribute both take effect inside despite the isolation. Overrides live
// here (not on the section) so the code tabs keep following the docs theme.
export function DemoSurface({ children }: { children: React.ReactNode }) {
  const { theme, dir } = useDemoControls();
  const colorTheme = useDocsColorTheme();
  // Popup content (menus, sheets, dialogs) portals to document.body per Base UI
  // and deliberately keeps the docs-level theme/direction — pass `container`
  // explicitly to a *Content component to scope it (see the library README).

  return (
    <Typography
      as="div"
      variant="body-large"
      className="demo-surface"
      dir={dir}
      data-theme={theme ?? undefined}
      data-color-theme={theme && colorTheme && colorTheme !== "default" ? colorTheme : undefined}
    >
      {children}
    </Typography>
  );
}

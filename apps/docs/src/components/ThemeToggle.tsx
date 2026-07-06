"use client";

import * as React from "react";
import { Fab } from "@brijbyte/md3-react/fab";
import MoonIcon from "@brijbyte/md3-icons/outlined/DarkMode";
import SunIcon from "@brijbyte/md3-icons/outlined/LightMode";

type Theme = "light" | "dark";

function useTheme() {
  // Root's inline script sets data-theme before paint from localStorage / OS
  // preference; during server prerender there is no document, so default light.
  const [theme, setTheme] = React.useState<Theme>(() =>
    typeof document !== "undefined" && document.documentElement.dataset.theme === "light"
      ? "light"
      : "dark",
  );

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return [theme, setTheme] as const;
}

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  return (
    // Icons swap via CSS, not state: the static HTML is theme-agnostic,
    // so hydration matches whatever theme the inline script applied.
    <Fab
      className="fixed right-4 bottom-4 z-10"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      icon={
        <>
          <MoonIcon className="dark:hidden" />
          <SunIcon className="hidden dark:inline" />
        </>
      }
    />
  );
}

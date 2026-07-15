"use client";

import * as React from "react";
import { SplitButton, SplitButtonAction, SplitButtonMenu } from "@/ui/split-button";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/ui/menu";
import MoonIcon from "@brijbyte/md3-icons/outlined/DarkMode";
import SunIcon from "@brijbyte/md3-icons/outlined/LightMode";
import ArrowDownIcon from "@brijbyte/md3-icons/outlined/KeyboardArrowDown";
import { IconSwap } from "./IconSwap";
import "./ThemeToggle.css";

type Theme = "light" | "dark";

// Mirrors apps/docs/scripts/build-color-themes.mjs's SEEDS map ("default" is
// the library's baseline purple — no override CSS needed for it).
export const COLOR_THEMES = [
  { value: "default", label: "Default", seed: "#6750A4" },
  { value: "blue", label: "Blue", seed: "#1B6EF3" },
  { value: "teal", label: "Teal", seed: "#00696B" },
  { value: "green", label: "Green", seed: "#3E6837" },
  { value: "amber", label: "Amber", seed: "#8C5000" },
  { value: "red", label: "Red", seed: "#904A42" },
  { value: "pink", label: "Pink", seed: "#984061" },
] as const;

export function useTheme() {
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

export function useColorTheme() {
  const [colorTheme, setColorTheme] = React.useState(() =>
    typeof document !== "undefined" ? document.documentElement.dataset.colorTheme! : "default",
  );

  React.useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
    if (colorTheme === "default") {
      localStorage.removeItem("color-theme");
    } else {
      localStorage.setItem("color-theme", colorTheme);
    }
  }, [colorTheme]);

  return [colorTheme, setColorTheme] as const;
}

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const [colorTheme, setColorTheme] = useColorTheme();

  return (
    <SplitButton variant="filled" size="xsmall">
      <SplitButtonAction
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        icon={
          <IconSwap className="theme-toggle-icon">
            <MoonIcon />
            <SunIcon />
          </IconSwap>
        }
      >
        <span className="dark:hidden font-mono">Dark&nbsp;</span>
        <span className="hidden dark:inline font-mono">Light</span>
      </SplitButtonAction>
      <Menu>
        <MenuTrigger render={<SplitButtonMenu aria-label="Choose color theme" />}>
          <ArrowDownIcon />
        </MenuTrigger>
        <MenuContent side="bottom" align="end">
          <MenuRadioGroup value={colorTheme} onValueChange={(value) => setColorTheme(value)}>
            {COLOR_THEMES.map(({ value, label, seed }) => (
              <MenuRadioItem
                key={value}
                value={value}
                leadingIcon={
                  <span
                    aria-hidden
                    className="inline-block size-4.5 rounded-full"
                    style={{ backgroundColor: seed }}
                  />
                }
                className="font-mono"
              >
                {label}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    </SplitButton>
  );
}

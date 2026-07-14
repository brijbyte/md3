"use client";

import Link from "next/link";
import { FabMenu, FabMenuContent, FabMenuItem, FabMenuTrigger } from "@/ui/fab-menu";
import CheckIcon from "@brijbyte/md3-icons/outlined/Check";
import HomeIcon from "@brijbyte/md3-icons/outlined/Home";
import MoonIcon from "@brijbyte/md3-icons/outlined/DarkMode";
import PaletteIcon from "@brijbyte/md3-icons/outlined/Palette";
import SunIcon from "@brijbyte/md3-icons/outlined/LightMode";
import { COLOR_THEMES, useColorTheme, useTheme } from "./ThemeToggle";

// Standalone showcase chrome: the landing header's controls (way home, theme
// toggle, color themes) docked as a FAB menu in the bottom corner. The popup
// is portalled and mounts only on open, so its content can be state-driven
// without hydration concerns.
export function ShowcaseFabMenu() {
  const [theme, setTheme] = useTheme();
  const [colorTheme, setColorTheme] = useColorTheme();

  return (
    <div className="inset-s-6 fixed bottom-6 z-(--md-ref-z-index-docked)">
      <FabMenu color="secondary">
        <FabMenuTrigger icon={<PaletteIcon />} aria-label="Theme and navigation" />
        {/* align follows the FAB's corner: start-docked, so leading edge. */}
        <FabMenuContent align="start">
          <FabMenuItem render={<Link href="/" />} icon={<HomeIcon />}>
            MD3 React docs
          </FabMenuItem>
          <FabMenuItem
            icon={theme === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "Dark theme" : "Light theme"}
          </FabMenuItem>
          {COLOR_THEMES.map(({ value, label, seed }) => (
            <FabMenuItem
              key={value}
              onClick={() => setColorTheme(value)}
              icon={
                <span
                  aria-hidden
                  className="flex size-4.5 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: seed }}
                >
                  {value === colorTheme && <CheckIcon width={14} height={14} />}
                </span>
              }
            >
              {label}
            </FabMenuItem>
          ))}
        </FabMenuContent>
      </FabMenu>
    </div>
  );
}

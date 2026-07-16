// Root layout owning the HTML document (the old Root.tsx server component).
// app.css @imports the library CSS; cascade-layer order is pinned by the
// postcss-layer-order plugin, which prepends it to every stylesheet.

import "./app.css";

import type { Metadata } from "next";
import { Roboto_Mono, Roboto_Flex } from "next/font/google";
import type * as React from "react";
import appleTouchIcon from "@/assets/apple-touch-icon.png";
import favicon16Dark from "@/assets/favicon-16-dark.png";
import favicon16 from "@/assets/favicon-16.png";
import favicon32Dark from "@/assets/favicon-32-dark.png";
import favicon32 from "@/assets/favicon-32.png";
import favicon from "@/assets/favicon.ico";
import logoDark from "@/assets/logo-dark-transparent.svg";
import logo from "@/assets/logo-transparent.svg";
import { NavigationProgress } from "../components/NavigationProgress";
import { SkipLink } from "../components/SkipLink";
import { HOME } from "../nav";

export const metadata: Metadata = {
  title: {
    default: "MD3 React — Material Design 3 for React",
    template: "%s — MD3 React",
  },
  description: HOME.description,
  icons: {
    // Light/dark favicons follow the OS scheme (browser UI, not the site toggle).
    icon: [
      { url: favicon.src, sizes: "48x48" },
      {
        url: favicon16.src,
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: favicon32.src,
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: favicon16Dark.src,
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: favicon32Dark.src,
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      { url: logo.src, type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: logoDark.src, type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
    apple: appleTouchIcon.src,
  },
};

const plain = Roboto_Flex({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});
const mono = Roboto_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

// Apply persisted theme before first paint to avoid a flash.
// __syncFavicon retargets the icon links' prefers-color-scheme media attrs to
// the site theme (data-theme), which can diverge from the OS scheme.
const themeInitScript = `
const stored = localStorage.getItem("theme");
const theme =
  stored === "light"
    ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
document.documentElement.dataset.theme = theme;
document.documentElement.dataset.colorTheme = localStorage.getItem("color-theme") ?? "default";
window.__syncFavicon = (t) => {
  for (const link of document.querySelectorAll("link[rel='icon'][media], link[rel='icon'][data-scheme]")) {
    const scheme = (link.dataset.scheme ??= link.media.includes("dark") ? "dark" : "light");
    link.media = scheme === t ? "all" : "not all";
  }
};
window.__syncFavicon(theme);
document.addEventListener("DOMContentLoaded", () => window.__syncFavicon(theme));
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme / data-color-theme are set by the inline script before paint.
    // scrollbar-gutter must live on <html>: browsers propagate it to the
    // viewport only from the root element (body would only affect body's box).
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="dark"
      data-color-theme="default"
      className={`scheme-light data-[theme='dark']:scheme-dark data-navigating:cursor-progress scrollbar-gutter-stable ${plain.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased bg-background text-on-background font-plain text-body-large">
        <SkipLink />
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}

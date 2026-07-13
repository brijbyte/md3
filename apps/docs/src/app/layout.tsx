// Root layout owning the HTML document (the old Root.tsx server component).
// app.css @imports the library CSS; cascade-layer order is pinned by the
// postcss-layer-order plugin, which prepends it to every stylesheet.
import "./app.css";

import type { Metadata } from "next";
import type * as React from "react";
import { NavigationProgress } from "../components/NavigationProgress";
import { HOME } from "../nav";

export const metadata: Metadata = {
  title: {
    default: "MD3 React — Material Design 3 for React",
    template: "%s — MD3 React",
  },
  description: HOME.description,
};

// Apply persisted theme before first paint to avoid a flash.
const themeInitScript = `
const stored = localStorage.getItem("theme");
document.documentElement.dataset.theme =
  stored === "light"
    ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
document.documentElement.dataset.colorTheme = localStorage.getItem("color-theme") ?? "default";
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
      className="scheme-light data-[theme='dark']:scheme-dark data-navigating:cursor-progress scrollbar-gutter-stable"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen antialiased bg-background text-on-background font-plain text-body-large">
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}

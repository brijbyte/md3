import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";

// Real-browser DOM via Playwright (no jsdom). CSS Modules resolve through Vite.
export default defineConfig({
  plugins: [react()],
  // Base UI's hooks (useId etc.) break if the optimizer bundles a second React copy;
  // dedupe + pre-bundling @base-ui/react keeps a single instance in the browser deps.
  resolve: { dedupe: ["react", "react-dom"] },
  optimizeDeps: { include: ["react", "react-dom", "react-dom/client", "@base-ui/react"] },
  test: {
    name: "react",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});

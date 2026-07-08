import { defineConfig } from "vitest/config";

// Node-env unit tests for the docs app's pure helpers (no browser needed).
export default defineConfig({
  test: {
    name: "docs",
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});

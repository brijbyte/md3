import { defineConfig } from "vitest/config";

// Workspace-level test runner: picks up each package's own vitest.config.ts.
export default defineConfig({
  test: {
    projects: ["packages/*", "apps/docs"],
  },
});

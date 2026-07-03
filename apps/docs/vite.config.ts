import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Library aliases live in tsconfig.json "paths" (single source of truth).
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
});

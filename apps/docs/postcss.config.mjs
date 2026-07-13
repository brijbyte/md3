import { fileURLToPath } from "node:url";

// Tailwind v4, then the cascade-layer order pin on every stylesheet.
// Next requires postcss plugins by string; the local plugin resolves by
// absolute path (a relative one fails from Turbopack's bundled runtime).
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    [fileURLToPath(new URL("./postcss-layer-order.cjs", import.meta.url))]: {},
  },
};

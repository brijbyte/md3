import * as React from "react";
import { createRoot } from "react-dom/client";
// layers.css first: it pins the cascade-layer order everything else slots into.
import "./layers.css";
import "./app.css";
import "@brijbyte/md3-react/styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

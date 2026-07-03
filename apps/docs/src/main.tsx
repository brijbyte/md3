import * as React from "react";
import { createRoot } from "react-dom/client";
import "@brijbyte/md3-react/styles.css";
import "./reset.css";
import "./app.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

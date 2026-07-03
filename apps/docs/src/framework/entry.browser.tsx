import { createFromFetch, createFromReadableStream } from "@vitejs/plugin-rsc/browser";
import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";
import type { RscPayload } from "./shared";

// A page's RSC payload is a static file next to its HTML (see entry.rsc).
function rscUrl(href: string): string {
  const url = new URL(href);
  url.pathname = `${url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`}index.rsc`;
  return url.toString();
}

async function main() {
  const initialPayload = await createFromReadableStream<RscPayload>(rscStream);

  let setPayload: (v: RscPayload) => void;

  async function onNavigation() {
    try {
      const payload = await createFromFetch<RscPayload>(fetch(rscUrl(window.location.href)));
      setPayload(payload);
    } catch {
      // Payload missing/unreachable (404, offline): fall back to a full load.
      window.location.reload();
    }
  }

  function BrowserRoot() {
    const [payload, setPayload_] = React.useState(initialPayload);

    React.useEffect(() => {
      setPayload = (v) => React.startTransition(() => setPayload_(v));
    }, []);

    React.useEffect(() => listenNavigation(onNavigation), []);

    return payload.root;
  }

  hydrateRoot(
    document,
    <React.StrictMode>
      <BrowserRoot />
    </React.StrictMode>,
  );

  // Server-component edits in dev: re-fetch the payload instead of reloading.
  if (import.meta.hot) {
    import.meta.hot.on("rsc:update", () => onNavigation());
  }
}

// Intercept same-origin link clicks and history moves for soft navigation.
function listenNavigation(onNavigation: () => void): () => void {
  window.addEventListener("popstate", onNavigation);

  const oldPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const res = oldPushState.apply(this, args);
    onNavigation();
    return res;
  };

  const oldReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    const res = oldReplaceState.apply(this, args);
    onNavigation();
    return res;
  };

  document.addEventListener("click", onClick);

  return () => {
    document.removeEventListener("click", onClick);
    window.removeEventListener("popstate", onNavigation);
    window.history.pushState = oldPushState;
    window.history.replaceState = oldReplaceState;
  };
}

// Soft-navigate plain left-clicks on same-origin links; let the browser handle
// the rest (new tab, download, external, modified clicks).
function onClick(e: MouseEvent) {
  const link = (e.target as Element).closest("a");
  if (
    link &&
    link.href &&
    (!link.target || link.target === "_self") &&
    link.origin === location.origin &&
    !link.hasAttribute("download") &&
    e.button === 0 && // left clicks only
    !e.metaKey && // open in new tab (mac)
    !e.ctrlKey && // open in new tab (windows)
    !e.altKey && // download
    !e.shiftKey &&
    !e.defaultPrevented
  ) {
    e.preventDefault();
    history.pushState(null, "", link.href);
    window.scrollTo(0, 0);
  }
}

main();

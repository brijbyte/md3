import { createFromFetch, createFromReadableStream } from "@vitejs/plugin-rsc/browser";
import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";
import type { RscPayload } from "./shared";

// A page's RSC payload is a static file next to its HTML (see entry.rsc):
// /buttons → /buttons.rsc; /dir/ → /dir/index.rsc.
function rscUrl(href: string): string {
  const url = new URL(href);
  url.pathname = url.pathname.endsWith("/") ? `${url.pathname}index.rsc` : `${url.pathname}.rsc`;
  return url.toString();
}

// Rebound by BrowserRoot's effect once hydration is live.
let navigate: () => void = () => {};

async function main() {
  const initialPayload = await createFromReadableStream<RscPayload>(rscStream);

  function BrowserRoot() {
    const [payload, setPayload] = React.useState(initialPayload);
    // Async transition: isPending turns on when navigation starts, covering
    // the payload fetch itself — not just the render after it lands.
    const [isPending, startTransition] = React.useTransition();

    React.useEffect(() => {
      navigate = () =>
        startTransition(async () => {
          try {
            const next = await createFromFetch<RscPayload>(fetch(rscUrl(window.location.href)));
            // React loses the transition context across await; re-wrap the commit.
            startTransition(() => setPayload(next));
          } catch {
            // Payload missing/unreachable (404, offline): fall back to a full load.
            window.location.reload();
          }
        });
      return listenNavigation(() => navigate());
    }, [startTransition]);

    // In-flight feedback: app.css shows an MD3 linear progress bar on this hook.
    React.useEffect(() => {
      document.documentElement.toggleAttribute("data-navigating", isPending);
    }, [isPending]);

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
    import.meta.hot.on("rsc:update", () => navigate());
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

import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import * as React from "react";
import { renderToReadableStream } from "react-dom/server.edge";
import { prerender } from "react-dom/static.edge";
import { injectRSCPayload } from "rsc-html-stream/server";
import type { RscPayload } from "./shared";

export async function renderHtml(
  rscStream: ReadableStream<Uint8Array>,
  options?: { ssg?: boolean },
): Promise<ReadableStream<Uint8Array>> {
  // One copy renders to HTML here; the other is inlined into the page
  // so the browser can hydrate from the exact same RSC payload.
  const [rscStream1, rscStream2] = rscStream.tee();

  let payload: Promise<RscPayload> | undefined;
  function SsrRoot() {
    payload ??= createFromReadableStream<RscPayload>(rscStream1);
    return React.use(payload).root;
  }

  const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent("index");

  // prerender() waits for the full tree (static output); the streaming
  // renderer is enough for dev.
  const htmlStream = options?.ssg
    ? (await prerender(<SsrRoot />, { bootstrapScriptContent })).prelude
    : await renderToReadableStream(<SsrRoot />, { bootstrapScriptContent });

  return htmlStream.pipeThrough(injectLayerPin()).pipeThrough(injectRSCPayload(rscStream2));
}

// The cascade-layer order must be the first layer declaration the browser
// parses, but React emits the stylesheet <link>s in an order we don't control
// (client-reference CSS before the server CSS containing layers.css). Inject
// the pin inline at the top of <head> so it always wins.
const LAYER_PIN =
  "<style>@layer theme, base, md3.tokens, md3.components, components, utilities;</style>";

function injectLayerPin(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let injected = false;
  return new TransformStream({
    transform(chunk, controller) {
      if (injected) {
        controller.enqueue(chunk);
        return;
      }
      // Buffer until <head> appears (it could straddle chunk boundaries).
      buffer += decoder.decode(chunk, { stream: true });
      const i = buffer.indexOf("<head>");
      if (i !== -1) {
        injected = true;
        const at = i + "<head>".length;
        controller.enqueue(encoder.encode(buffer.slice(0, at) + LAYER_PIN + buffer.slice(at)));
        buffer = "";
      }
    },
    flush(controller) {
      if (buffer) controller.enqueue(encoder.encode(buffer));
    },
  });
}

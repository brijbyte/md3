import { renderToReadableStream } from "@vitejs/plugin-rsc/rsc";
import Root from "../Root";
import { NAV } from "../nav";
import type { RscPayload } from "./shared";

// A page's RSC payload lives next to its HTML (/buttons.rsc, /dir/index.rsc) —
// a plain static file after build, and a route the dev handler answers below.
const RSC_EXT = ".rsc";

// Cascade-layer order pin. plugin-rsc's stylesheet links are hoisted into <head>
// in per-page-varying order, and the pin only holds if it's parsed before any
// @layer block. As a hoistable <style> rendered before <Root>, its precedence
// group is encountered first, so React places it above every stylesheet link.
const LAYER_PIN = "@layer theme, base, md3.tokens, md3.components, components, utilities;";

function App({ url }: { url: URL }) {
  return (
    <>
      <style href="md3-layer-pin" precedence="md3-layer-pin">
        {LAYER_PIN}
      </style>
      <Root url={url} />
    </>
  );
}

// Every route is prerendered at build time (see renderStatic in vite.config).
export function getStaticPaths(): string[] {
  return NAV.map((item) => item.path);
}

// Dev-server handler: serve the RSC payload or the full HTML document.
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const isRsc = url.pathname.endsWith(RSC_EXT);
  if (isRsc) {
    url.pathname = url.pathname.slice(0, -RSC_EXT.length);
    // "/dir/index.rsc" → "/dir/" (Root strips the slash back off).
    if (url.pathname.endsWith("/index")) url.pathname = url.pathname.slice(0, -"index".length);
  }

  const rscStream = renderToReadableStream<RscPayload>({ root: <App url={url} /> });
  if (isRsc) {
    return new Response(rscStream, {
      headers: { "content-type": "text/x-component;charset=utf-8" },
    });
  }
  const ssr = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
  const html = await ssr.renderHtml(rscStream);
  return new Response(html, { headers: { "content-type": "text/html;charset=utf-8" } });
}

// Build-time (SSG) handler: one render, teed into the HTML and the .rsc file.
export async function handleSsg(request: Request): Promise<{
  html: ReadableStream<Uint8Array>;
  rsc: ReadableStream<Uint8Array>;
}> {
  const rscStream = renderToReadableStream<RscPayload>({
    root: <App url={new URL(request.url)} />,
  });
  const [forHtml, forFile] = rscStream.tee();
  const ssr = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
  return { html: await ssr.renderHtml(forHtml, { ssg: true }), rsc: forFile };
}

if (import.meta.hot) {
  import.meta.hot.accept();
}

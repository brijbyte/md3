import type * as React from "react";
import { Demo } from "./demo";

// Called from loader-generated code in demo modules (demo-loader.mjs): wraps a
// demo entry component in the <Demo> chrome with its highlighted-sources URL.
export function createDemo<P extends object>(Component: React.ComponentType<P>, codeUrl: string) {
  return function DemoWrapped(props: P) {
    return (
      <Demo codeUrl={codeUrl}>
        <Component {...props} />
      </Demo>
    );
  };
}

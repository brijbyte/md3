import type * as React from "react";
import { Demo, type DemoFile } from "./demo";

// Called from loader-generated code in demo modules (demo-loader.mjs):
// wraps a demo entry component in the <Demo> chrome with its highlighted sources.
export function createDemo<P extends object>(Component: React.ComponentType<P>, files: DemoFile[]) {
  return function DemoWrapped(props: P) {
    return (
      <Demo files={files}>
        <Component {...props} />
      </Demo>
    );
  };
}

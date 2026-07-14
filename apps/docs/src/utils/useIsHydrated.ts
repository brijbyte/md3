import * as React from "react";

function noop() {}

export function useIsHydrated() {
  return React.useSyncExternalStore(
    () => noop,
    () => true,
    () => false,
  );
}

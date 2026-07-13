import type * as React from "react";

// Shape of the serialized RSC stream shared by all three entries.
export type RscPayload = {
  root: React.ReactNode;
};

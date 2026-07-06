import type { Priority } from "./types";
import { PRIORITY_LABEL } from "./types";

export function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-label-small font-bold"
      data-priority={priority}
      style={{
        background:
          priority === "high"
            ? "var(--md-sys-color-error-container)"
            : priority === "medium"
              ? "var(--md-sys-color-tertiary-container)"
              : "var(--md-sys-color-surface-container-high)",
        color:
          priority === "high"
            ? "var(--md-sys-color-on-error-container)"
            : priority === "medium"
              ? "var(--md-sys-color-on-tertiary-container)"
              : "var(--md-sys-color-on-surface-variant)",
      }}
    >
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

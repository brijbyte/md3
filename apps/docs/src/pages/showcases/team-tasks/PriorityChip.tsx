import type { Priority } from "./types";
import { PRIORITY_LABEL } from "./types";

export function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <span className="team-tasks-priority" data-priority={priority}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

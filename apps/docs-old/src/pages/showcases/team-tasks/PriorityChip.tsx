import type { Priority } from "./types";
import { PRIORITY_LABEL } from "./types";
import styles from "./PriorityChip.module.css";

export function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <span className={styles.priority} data-priority={priority}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}

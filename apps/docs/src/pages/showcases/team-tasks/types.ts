export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  detail: string;
  priority: Priority;
  done: boolean;
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Ship the onboarding redesign",
    detail: "Land the new first-run flow behind the `onboarding-v2` flag before Friday's cut.",
    priority: "high",
    done: false,
  },
  {
    id: "t2",
    title: "Review Priya's PR on the export pipeline",
    detail: "Focus on the retry logic around the flaky S3 upload step.",
    priority: "high",
    done: false,
  },
  {
    id: "t3",
    title: "Write the Q3 roadmap doc",
    detail: "Summarize the last planning session into a doc the team can comment on.",
    priority: "medium",
    done: false,
  },
  {
    id: "t4",
    title: "Triage new bug reports",
    detail: "Clear the inbox down to zero and tag anything customer-impacting.",
    priority: "medium",
    done: true,
  },
  {
    id: "t5",
    title: "Update the design token changelog",
    detail: "Note the shape-token renames so downstream teams aren't surprised.",
    priority: "low",
    done: false,
  },
];

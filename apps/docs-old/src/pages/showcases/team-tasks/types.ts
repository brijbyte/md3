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
  {
    id: "t6",
    title: "Cut the 3.2 release candidate",
    detail: "Tag the RC, run the smoke suite, and post the changelog to #releases.",
    priority: "high",
    done: false,
  },
  {
    id: "t7",
    title: "Migrate analytics off the legacy SDK",
    detail: "Swap the deprecated tracker for the new client and verify event parity.",
    priority: "medium",
    done: false,
  },
  {
    id: "t8",
    title: "Fix flaky checkout integration test",
    detail: "The Stripe webhook mock races the redirect — add a proper wait.",
    priority: "high",
    done: true,
  },
  {
    id: "t9",
    title: "Draft the incident postmortem",
    detail: "Timeline, root cause, and action items from Tuesday's outage.",
    priority: "high",
    done: false,
  },
  {
    id: "t10",
    title: "Audit bundle size regressions",
    detail: "The dashboard chunk grew 40kb — find what pulled in moment.js.",
    priority: "medium",
    done: false,
  },
  {
    id: "t11",
    title: "Refresh the marketing screenshots",
    detail: "Retake the hero shots against the new dark theme for the landing page.",
    priority: "low",
    done: false,
  },
  {
    id: "t12",
    title: "Set up preview deploys for docs PRs",
    detail: "Wire the CI job so every docs PR gets a shareable URL.",
    priority: "medium",
    done: true,
  },
  {
    id: "t13",
    title: "Add keyboard shortcuts to the board",
    detail: "j/k to move, x to toggle done, / to focus search.",
    priority: "low",
    done: false,
  },
  {
    id: "t14",
    title: "Interview two backend candidates",
    detail: "System design round — coordinate with the hiring panel on rubric.",
    priority: "medium",
    done: false,
  },
  {
    id: "t15",
    title: "Rotate the leaked API credentials",
    detail: "Revoke the exposed key, issue a new one, and update the secrets store.",
    priority: "high",
    done: false,
  },
  {
    id: "t16",
    title: "Document the new theming tokens",
    detail: "Write the migration guide for consumers moving off the old color vars.",
    priority: "low",
    done: false,
  },
  {
    id: "t17",
    title: "Profile the slow board query",
    detail: "The tasks list N+1s on assignees — add the join and an index.",
    priority: "medium",
    done: false,
  },
  {
    id: "t18",
    title: "Enable strict mode in the API package",
    detail: "Turn on the remaining tsconfig flags and fix the fallout incrementally.",
    priority: "low",
    done: true,
  },
  {
    id: "t19",
    title: "Prep the sprint demo",
    detail: "Script the walkthrough of the new insights panel for Thursday's review.",
    priority: "medium",
    done: false,
  },
  {
    id: "t20",
    title: "Respond to the accessibility audit",
    detail: "Fix the focus-order and contrast issues flagged on the settings screen.",
    priority: "high",
    done: false,
  },
  {
    id: "t21",
    title: "Clean up stale feature flags",
    detail: "Remove the six flags that have been fully rolled out for a month.",
    priority: "low",
    done: false,
  },
  {
    id: "t22",
    title: "Upgrade the CI runners to the new image",
    detail: "Node 26 base image; verify the icon build cache still hits.",
    priority: "medium",
    done: false,
  },
];

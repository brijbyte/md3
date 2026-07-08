"use client";

import * as React from "react";
import { AssistChip, FilterChip } from "@brijbyte/md3-react/chip";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Fab } from "@brijbyte/md3-react/fab";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetTitle,
  BottomSheetClose,
} from "@brijbyte/md3-react/bottom-sheet";
import { Typography } from "@brijbyte/md3-react/typography";

import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import CalendarTodayIcon from "@brijbyte/md3-icons/outlined/CalendarToday";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";

import { useAddTask } from "./AddTaskDialog";
import { PriorityChip } from "./PriorityChip";
import { type Priority, type Task } from "./types";

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  return (
    <li className="team-tasks-row">
      <Checkbox
        className="team-tasks-checkbox"
        checked={task.done}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as done`}
      />
      <BottomSheet>
        <BottomSheetTrigger render={<button type="button" className="team-tasks-row-main" />}>
          <Typography variant="body-large" className={task.done ? "team-tasks-done" : ""}>
            {task.title}
          </Typography>
          <Typography variant="body-small" className="team-tasks-row-detail team-tasks-muted">
            {task.detail}
          </Typography>
        </BottomSheetTrigger>
        <BottomSheetContent className="team-tasks-sheet">
          <div className="team-tasks-sheet-head">
            {/* This is app UI, not a doc page — Roboto (plain) over title-large's brand default. */}
            <BottomSheetTitle
              render={<Typography variant="title-large" className="team-tasks-plain" />}
            >
              {task.title}
            </BottomSheetTitle>
            <BottomSheetClose render={<IconButton aria-label="Close" variant="standard" />}>
              <CloseIcon />
            </BottomSheetClose>
          </div>
          <Typography variant="body-medium" className="team-tasks-muted">
            {task.detail}
          </Typography>
          <div className="team-tasks-sheet-meta">
            <PriorityChip priority={task.priority} />
            <AssistChip icon={<CalendarTodayIcon />}>Due this week</AssistChip>
          </div>
          <div className="team-tasks-sheet-actions">
            <BottomSheetClose render={<IconButton aria-label="Delete task" variant="standard" />}>
              <DeleteIcon />
            </BottomSheetClose>
          </div>
        </BottomSheetContent>
      </BottomSheet>
      <PriorityChip priority={task.priority} />
    </li>
  );
}

export function BoardPanel({
  tasks,
  toggleTask,
}: {
  tasks: Task[];
  toggleTask: (id: string) => void;
}) {
  const { requestOpen, morphClassName } = useAddTask();
  const [activeFilters, setActiveFilters] = React.useState<ReadonlySet<Priority>>(new Set());

  function togglePriorityFilter(priority: Priority, pressed: boolean) {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (pressed) next.add(priority);
      else next.delete(priority);
      return next;
    });
  }

  const visible = tasks.filter(
    (task) => activeFilters.size === 0 || activeFilters.has(task.priority),
  );

  return (
    <div className="team-tasks-board">
      <div className="team-tasks-filters">
        <FilterChip
          pressed={activeFilters.has("high")}
          onPressedChange={(pressed) => togglePriorityFilter("high", pressed)}
        >
          High priority
        </FilterChip>
        <FilterChip
          pressed={activeFilters.has("medium")}
          onPressedChange={(pressed) => togglePriorityFilter("medium", pressed)}
        >
          Medium priority
        </FilterChip>
        <FilterChip
          pressed={activeFilters.has("low")}
          onPressedChange={(pressed) => togglePriorityFilter("low", pressed)}
        >
          Low priority
        </FilterChip>
      </div>

      <ul className="team-tasks-list">
        {visible.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} />
        ))}
        {visible.length === 0 && (
          <li className="team-tasks-empty">
            <Typography variant="body-medium" className="team-tasks-muted">
              No tasks at this priority.
            </Typography>
          </li>
        )}
      </ul>

      <Fab
        aria-label="Add task"
        icon={<AddIcon />}
        onClick={() => requestOpen("fab")}
        className={`team-tasks-fab ${morphClassName("fab")}`}
      />
    </div>
  );
}

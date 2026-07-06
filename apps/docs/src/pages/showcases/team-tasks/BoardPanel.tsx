"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Button } from "@brijbyte/md3-react/button";
import { AssistChip, FilterChip } from "@brijbyte/md3-react/chip";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Fab } from "@brijbyte/md3-react/fab";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { useSnackbar } from "@brijbyte/md3-react/snackbar";
import {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetTitle,
  BottomSheetClose,
} from "@brijbyte/md3-react/bottom-sheet";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeadline,
  DialogActions,
  DialogClose,
} from "@brijbyte/md3-react/dialog";
import { TextField } from "@brijbyte/md3-react/text-field";
import { Typography } from "@brijbyte/md3-react/typography";

import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import CalendarTodayIcon from "@brijbyte/md3-icons/outlined/CalendarToday";
import CloseIcon from "@brijbyte/md3-icons/outlined/Close";
import DeleteIcon from "@brijbyte/md3-icons/outlined/Delete";

import { PriorityChip } from "./PriorityChip";
import { INITIAL_TASKS, PRIORITY_LABEL, type Priority, type Task } from "./types";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

function AddTaskDialog({ onAdd }: { onAdd: (task: Omit<Task, "id" | "done">) => void }) {
  const [open, setOpen] = React.useState(false);
  const [priority, setPriority] = React.useState<Priority>("medium");

  // MD3 container transform: FAB ↔ dialog share a view-transition-name (one at a
  // time), and the open flip is committed synchronously inside the transition so
  // the browser morphs between the two snapshots. Plain state change elsewhere.
  function setOpenWithMorph(nextOpen: boolean) {
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setOpen(nextOpen);
      return;
    }
    // Direction hook for the morph CSS (the collapse carries the FAB's radius).
    document.documentElement.dataset.addTaskMorph = nextOpen ? "open" : "close";
    const transition = document.startViewTransition(() => {
      flushSync(() => setOpen(nextOpen));
    });
    // An aborted morph (e.g. rapid toggling) should degrade silently, not throw.
    transition.finished
      .catch(() => {})
      .finally(() => {
        delete document.documentElement.dataset.addTaskMorph;
      });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setPriority("medium");
    setOpenWithMorph(nextOpen);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    onAdd({ title, detail: String(data.get("detail") ?? "").trim(), priority });
    setOpenWithMorph(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Fab
            aria-label="Add task"
            icon={<AddIcon />}
            className={`sticky bottom-6 float-right mt-6 ${open ? "" : "[view-transition-name:add-task]"}`}
          />
        }
      />
      <DialogContent className="team-tasks-add-morph w-full">
        <DialogHeadline>New task</DialogHeadline>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <TextField name="title" label="Title" variant="outlined" required />
          <TextField name="detail" label="Detail" variant="outlined" multiline rows={2} />
          <div>
            <Typography variant="label-large" as="p" className="mb-2">
              Priority
            </Typography>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <FilterChip
                  key={p}
                  pressed={priority === p}
                  onPressedChange={(pressed) => pressed && setPriority(p)}
                >
                  {PRIORITY_LABEL[p]}
                </FilterChip>
              ))}
            </div>
          </div>
          <DialogActions>
            <DialogClose render={<Button variant="text" />}>Cancel</DialogClose>
            <Button type="submit" variant="text">
              Add task
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  return (
    <li className="flex items-start gap-4 rounded-large bg-surface-container-low px-4 py-3">
      <Checkbox
        className="mt-1"
        checked={task.done}
        onCheckedChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as done`}
      />
      <BottomSheet>
        <BottomSheetTrigger render={<button type="button" className="min-w-0 flex-1 text-left" />}>
          <Typography
            variant="body-large"
            className={task.done ? "text-on-surface-variant line-through" : ""}
          >
            {task.title}
          </Typography>
          <Typography variant="body-small" className="mt-0.5 text-on-surface-variant">
            {task.detail}
          </Typography>
        </BottomSheetTrigger>
        <BottomSheetContent className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            {/* This is app UI, not a doc page — Roboto (plain) over title-large's brand default. */}
            <BottomSheetTitle render={<Typography variant="title-large" className="font-plain" />}>
              {task.title}
            </BottomSheetTitle>
            <BottomSheetClose render={<IconButton aria-label="Close" variant="standard" />}>
              <CloseIcon />
            </BottomSheetClose>
          </div>
          <Typography variant="body-medium" className="text-on-surface-variant">
            {task.detail}
          </Typography>
          <div className="flex items-center gap-3">
            <PriorityChip priority={task.priority} />
            <AssistChip icon={<CalendarTodayIcon />}>Due this week</AssistChip>
          </div>
          <div className="flex justify-end gap-2 pt-2">
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

export function BoardPanel() {
  const [tasks, setTasks] = React.useState(INITIAL_TASKS);
  const [activeFilters, setActiveFilters] = React.useState<ReadonlySet<Priority>>(new Set());
  const { showSnackbar } = useSnackbar();

  function togglePriorityFilter(priority: Priority, pressed: boolean) {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (pressed) next.add(priority);
      else next.delete(priority);
      return next;
    });
  }

  function toggle(id: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextDone = !task.done;
    setTasks((current) => current.map((t) => (t.id === id ? { ...t, done: nextDone } : t)));
    if (nextDone) {
      showSnackbar({
        message: `"${task.title}" marked done`,
        action: {
          label: "Undo",
          onClick: () =>
            setTasks((current) => current.map((t) => (t.id === id ? { ...t, done: false } : t))),
        },
      });
    }
  }

  function addTask(task: Omit<Task, "id" | "done">) {
    setTasks((current) => [...current, { ...task, id: crypto.randomUUID(), done: false }]);
    showSnackbar({ message: `"${task.title}" added` });
  }

  const visible = tasks.filter(
    (task) => activeFilters.size === 0 || activeFilters.has(task.priority),
  );

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap gap-2">
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

      <ul className="flex flex-col gap-2">
        {visible.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggle} />
        ))}
        {visible.length === 0 && (
          <li className="rounded-large bg-surface-container-low px-4 py-8 text-center">
            <Typography variant="body-medium" className="text-on-surface-variant">
              No tasks at this priority.
            </Typography>
          </li>
        )}
      </ul>

      <AddTaskDialog onAdd={addTask} />
    </div>
  );
}

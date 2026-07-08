"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Button } from "@brijbyte/md3-react/button";
import { FilterChip } from "@brijbyte/md3-react/chip";
import {
  Dialog,
  DialogContent,
  DialogHeadline,
  DialogActions,
  DialogClose,
} from "@brijbyte/md3-react/dialog";
import { TextField } from "@brijbyte/md3-react/text-field";
import { Typography } from "@brijbyte/md3-react/typography";

import { PRIORITY_LABEL, type Priority, type Task } from "./types";

const PRIORITIES: Priority[] = ["high", "medium", "low"];

// Which trigger the dialog morphs out of / back into. The shared morph name lives
// on exactly one element at a time, so we track the active source.
type MorphSource = "fab" | "header";

type AddTaskContextValue = {
  /** Open the dialog, morphing out of the given trigger. */
  requestOpen: (source: MorphSource) => void;
  /** Class that puts the shared morph name on this trigger while it is the source. */
  morphClassName: (source: MorphSource) => string;
};

const AddTaskContext = React.createContext<AddTaskContextValue | null>(null);

/** Trigger hook — a FAB, split button, etc. calls this to become a morph source. */
export function useAddTask() {
  const ctx = React.useContext(AddTaskContext);
  if (!ctx) throw new Error("useAddTask must be used within <AddTaskProvider>");
  return ctx;
}

export function AddTaskProvider({
  onAdd,
  children,
}: {
  onAdd: (task: Omit<Task, "id" | "done">) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [source, setSource] = React.useState<MorphSource>("fab");
  const [priority, setPriority] = React.useState<Priority>("medium");

  // MD3 container transform: the source trigger and the dialog share a
  // view-transition-name (one at a time); committing the open flip synchronously
  // inside the transition lets the browser morph between the two snapshots.
  const setOpenWithMorph = React.useCallback((nextOpen: boolean) => {
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setOpen(nextOpen);
      return;
    }
    // Direction hook for the morph CSS (the collapse carries the trigger's radius).
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
  }, []);

  const requestOpen = React.useCallback(
    (nextSource: MorphSource) => {
      setPriority("medium");
      // Hand the morph name to the clicked trigger before the snapshot is captured.
      flushSync(() => setSource(nextSource));
      setOpenWithMorph(true);
    },
    [setOpenWithMorph],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    onAdd({ title, detail: String(data.get("detail") ?? "").trim(), priority });
    setOpenWithMorph(false);
  }

  // Only the active source carries the name, and only while closed — once open the
  // dialog owns it, so no two elements ever hold the same name at once.
  const morphClassName = React.useCallback(
    (s: MorphSource) => (!open && source === s ? "team-tasks-morph-source" : ""),
    [open, source],
  );

  const context = React.useMemo<AddTaskContextValue>(
    () => ({ requestOpen, morphClassName }),
    [requestOpen, morphClassName],
  );

  return (
    <AddTaskContext.Provider value={context}>
      {children}
      <Dialog open={open} onOpenChange={setOpenWithMorph}>
        <DialogContent className="team-tasks-add-morph team-tasks-dialog">
          <DialogHeadline>New task</DialogHeadline>
          <form className="team-tasks-dialog-form" onSubmit={handleSubmit}>
            <TextField name="title" label="Title" variant="outlined" required />
            <TextField name="detail" label="Detail" variant="outlined" multiline rows={2} />
            <div>
              <Typography variant="label-large" as="p" className="team-tasks-field-label">
                Priority
              </Typography>
              <div className="team-tasks-chip-row">
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
    </AddTaskContext.Provider>
  );
}

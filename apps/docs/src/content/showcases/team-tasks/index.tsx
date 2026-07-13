"use client";

import * as React from "react";
import { SnackbarProvider, useSnackbar } from "@brijbyte/md3-react/snackbar";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";

import ChecklistIcon from "@brijbyte/md3-icons/outlined/Checklist";
import InsightsIcon from "@brijbyte/md3-icons/outlined/Insights";
import TuneIcon from "@brijbyte/md3-icons/outlined/Tune";

import { AddTaskProvider } from "./AddTaskDialog";
import { AppHeader } from "./AppHeader";
import { BoardPanel } from "./BoardPanel";
import { InsightsPanel } from "./InsightsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { INITIAL_TASKS, Task } from "./types";
import shared from "./team-tasks.module.css";

function ShowcaseTeamTasksInner() {
  const [tasks, setTasks] = React.useState(INITIAL_TASKS);
  const { showSnackbar, closeSnackbar } = useSnackbar();
  const snackbarId = React.useRef("");

  const addTask = React.useCallback((newTask: Omit<Task, "id" | "done">) => {
    setTasks((current) => [...current, { ...newTask, id: crypto.randomUUID(), done: false }]);
  }, []);

  const toggleTask = React.useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const nextDone = !task.done;
      const message = `"${task.title}" marked ${nextDone ? "done" : "not done"}`;
      setTasks(tasks.map((t) => (t.id === id ? { ...t, done: nextDone } : t)));

      if (snackbarId.current) {
        closeSnackbar(snackbarId.current);
        snackbarId.current = "";
      }
      if (nextDone) {
        snackbarId.current = showSnackbar({
          message,
          action: {
            label: "Undo",
            onClick: () => {
              closeSnackbar(snackbarId.current);
              snackbarId.current = "";
              setTasks((current) =>
                current.map((t) => (t.id === id ? { ...t, done: !nextDone } : t)),
              );
            },
          },
        });
      }
    },
    [showSnackbar, closeSnackbar, tasks],
  );

  return (
    <AddTaskProvider onAdd={addTask}>
      <AppHeader />

      <Tabs defaultValue="board">
        <TabList aria-label="Team Tasks" className={shared.tablist}>
          <Tab value="board" icon={<ChecklistIcon />}>
            Board
          </Tab>
          <Tab value="insights" icon={<InsightsIcon />}>
            Insights
          </Tab>
          <Tab value="settings" icon={<TuneIcon />}>
            Settings
          </Tab>
        </TabList>
        <TabPanel value="board" className={shared.panel} tabIndex={-1}>
          <BoardPanel tasks={tasks} toggleTask={toggleTask} />
        </TabPanel>
        <TabPanel value="insights" className={shared.panel} tabIndex={-1}>
          <InsightsPanel />
        </TabPanel>
        <TabPanel value="settings" className={shared.panel} tabIndex={-1}>
          <SettingsPanel />
        </TabPanel>
      </Tabs>
    </AddTaskProvider>
  );
}

export default function ShowcaseTeamTasks() {
  return (
    <SnackbarProvider>
      <ShowcaseTeamTasksInner />
    </SnackbarProvider>
  );
}

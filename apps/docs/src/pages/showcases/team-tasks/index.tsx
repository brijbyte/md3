"use client";

import { SnackbarProvider } from "@brijbyte/md3-react/snackbar";
import { Tab, TabList, TabPanel, Tabs } from "@brijbyte/md3-react/tabs";

import ChecklistIcon from "@brijbyte/md3-icons/outlined/Checklist";
import InsightsIcon from "@brijbyte/md3-icons/outlined/Insights";
import TuneIcon from "@brijbyte/md3-icons/outlined/Tune";

import { AppHeader } from "./AppHeader";
import { BoardPanel } from "./BoardPanel";
import { InsightsPanel } from "./InsightsPanel";
import { SettingsPanel } from "./SettingsPanel";

export default function ShowcaseTeamTasks() {
  return (
    <SnackbarProvider>
      <AppHeader />

      <Tabs defaultValue="board">
        <TabList aria-label="Team Tasks">
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
        <TabPanel value="board" className="pt-6">
          <BoardPanel />
        </TabPanel>
        <TabPanel value="insights" className="pt-6">
          <InsightsPanel />
        </TabPanel>
        <TabPanel value="settings" className="pt-6">
          <SettingsPanel />
        </TabPanel>
      </Tabs>
    </SnackbarProvider>
  );
}

import { Badge } from "@brijbyte/md3-react/badge";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@brijbyte/md3-react/menu";
import { SplitButton, SplitButtonAction, SplitButtonMenu } from "@brijbyte/md3-react/split-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@brijbyte/md3-react/tooltip";
import { Typography } from "@brijbyte/md3-react/typography";

import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import ArrowDownIcon from "@brijbyte/md3-icons/outlined/KeyboardArrowDown";
import LogoutIcon from "@brijbyte/md3-icons/outlined/Logout";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import PersonIcon from "@brijbyte/md3-icons/outlined/Person";
import TuneIcon from "@brijbyte/md3-icons/outlined/Tune";

import { useAddTask } from "./AddTaskDialog";

export function AppHeader() {
  const { requestOpen, morphClassName } = useAddTask();
  return (
    <header className="team-tasks-header">
      <div className="team-tasks-header-titles">
        {/* This is app UI, not a doc page — Roboto (plain) over display-small's brand default. */}
        <Typography as="h1" variant="display-small" className="team-tasks-display">
          Team Tasks
        </Typography>
        <Typography variant="title-medium" className="team-tasks-subtitle team-tasks-muted">
          Everything the Atlas squad is working on this sprint.
        </Typography>
      </div>
      <div className="team-tasks-actions">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<IconButton aria-label="Notifications" />}>
              <span className="team-tasks-notif">
                <NotificationsIcon />
                <Badge className="team-tasks-notif-badge">3</Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent>3 unread notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Menu>
          <MenuTrigger render={<IconButton aria-label="Account" variant="filled" />}>
            <PersonIcon />
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem leadingIcon={<PersonIcon />}>Your profile</MenuItem>
            <MenuItem leadingIcon={<TuneIcon />}>Preferences</MenuItem>
            <MenuSeparator />
            <MenuItem leadingIcon={<LogoutIcon />}>Sign out</MenuItem>
          </MenuContent>
        </Menu>

        <SplitButton className="team-tasks-new">
          <SplitButtonAction
            icon={<AddIcon />}
            onClick={() => requestOpen("header")}
            className={morphClassName("header")}
          >
            New task
          </SplitButtonAction>
          <Menu>
            <MenuTrigger render={<SplitButtonMenu aria-label="More ways to create" />}>
              <ArrowDownIcon />
            </MenuTrigger>
            <MenuContent align="end">
              <MenuItem>From template</MenuItem>
              <MenuItem>Import from CSV</MenuItem>
            </MenuContent>
          </Menu>
        </SplitButton>
      </div>
    </header>
  );
}

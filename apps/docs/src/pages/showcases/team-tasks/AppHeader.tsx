import { Popover } from "@base-ui/react/popover";
import { Badge } from "@brijbyte/md3-react/badge";
import { IconButton } from "@brijbyte/md3-react/icon-button";
import { List, ListItem } from "@brijbyte/md3-react/list";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@brijbyte/md3-react/menu";
import { SplitButton, SplitButtonAction, SplitButtonMenu } from "@brijbyte/md3-react/split-button";
import { Typography } from "@brijbyte/md3-react/typography";

import AddIcon from "@brijbyte/md3-icons/outlined/Add";
import AlternateEmailIcon from "@brijbyte/md3-icons/outlined/AlternateEmail";
import ArrowDownIcon from "@brijbyte/md3-icons/outlined/KeyboardArrowDown";
import LogoutIcon from "@brijbyte/md3-icons/outlined/Logout";
import NotificationsIcon from "@brijbyte/md3-icons/outlined/Notifications";
import PersonAddIcon from "@brijbyte/md3-icons/outlined/PersonAdd";
import PersonIcon from "@brijbyte/md3-icons/outlined/Person";
import TaskAltIcon from "@brijbyte/md3-icons/outlined/TaskAlt";
import TuneIcon from "@brijbyte/md3-icons/outlined/Tune";

import { useAddTask } from "./AddTaskDialog";

const NOTIFICATIONS = [
  {
    id: "mention",
    Icon: AlternateEmailIcon,
    title: "Priya mentioned you",
    body: "“Can you take the retry logic on the export PR?”",
    time: "2m",
  },
  {
    id: "done",
    Icon: TaskAltIcon,
    title: "Task completed",
    body: "Theo finished “Cut the 3.2 release candidate”",
    time: "1h",
  },
  {
    id: "assigned",
    Icon: PersonAddIcon,
    title: "Assigned to you",
    body: "“Rotate the leaked API credentials”",
    time: "3h",
  },
];

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
        <Popover.Root>
          <Popover.Trigger render={<IconButton aria-label="Notifications" />}>
            <span className="team-tasks-notif">
              <NotificationsIcon />
              <Badge className="team-tasks-notif-badge">3</Badge>
            </span>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner
              side="bottom"
              align="end"
              sideOffset={8}
              className="team-tasks-notif-positioner"
            >
              <Popover.Popup className="team-tasks-notif-popup">
                <Typography
                  variant="title-small"
                  className="team-tasks-notif-popup-title team-tasks-muted"
                >
                  Notifications
                </Typography>
                <List>
                  {NOTIFICATIONS.map(({ id, Icon, title, body, time }) => (
                    <ListItem
                      key={id}
                      leading={<Icon />}
                      supportingText={body}
                      trailingSupportingText={time}
                    >
                      {title}
                    </ListItem>
                  ))}
                </List>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

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

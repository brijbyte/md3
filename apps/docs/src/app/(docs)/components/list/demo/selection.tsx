import "@brijbyte/md3-react/ripple.css";
import "@brijbyte/md3-react/checkbox.css";
import "@brijbyte/md3-react/switch.css";
import "@brijbyte/md3-react/radio.css";
import "@brijbyte/md3-react/list.css";
import "./selection.css";

import { List, ListItem } from "@brijbyte/md3-react/list";
import { Checkbox } from "@brijbyte/md3-react/checkbox";
import { Switch } from "@brijbyte/md3-react/switch";
import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Typography } from "@brijbyte/md3-react/typography";

// Guidelines "Selection controls": position a checkbox, switch, or radio at the
// leading or trailing end of a row. The control owns the interaction, so the
// ListItem stays non-interactive (no nested clickables).
export default function ListSelectionDemo() {
  return (
    <div className="demo-list-selection">
      <div className="demo-list-group">
        <Typography variant="label-large" className="demo-list-caption">
          Switches — toggle a setting
        </Typography>
        <List className="demo-list">
          <ListItem
            as="label"
            supportingText="Get notified about mentions"
            trailing={<Switch defaultChecked aria-label="Mentions" />}
          >
            Mentions
          </ListItem>
          <ListItem
            as="label"
            supportingText="Play a sound on new messages"
            trailing={<Switch aria-label="Sounds" />}
          >
            Sounds
          </ListItem>
          <ListItem
            as="label"
            supportingText="Use the dark color scheme"
            trailing={<Switch defaultChecked aria-label="Dark theme" />}
          >
            Dark theme
          </ListItem>
        </List>
      </div>

      <div className="demo-list-group">
        <Typography variant="label-large" className="demo-list-caption">
          Checkboxes — select multiple
        </Typography>
        <List className="demo-list">
          <ListItem
            as="label"
            leading={<Checkbox defaultChecked aria-label="Draft the postmortem" />}
          >
            Draft the incident postmortem
          </ListItem>
          <ListItem as="label" leading={<Checkbox aria-label="Review the export PR" />}>
            Review the export PR
          </ListItem>
          <ListItem as="label" leading={<Checkbox aria-label="Cut the release candidate" />}>
            Cut the release candidate
          </ListItem>
        </List>
      </div>

      <div className="demo-list-group">
        <Typography variant="label-large" className="demo-list-caption">
          Radio buttons — select one
        </Typography>
        <RadioGroup defaultValue="standard">
          <List className="demo-list">
            <ListItem
              as="label"
              supportingText="Arrives in 5–7 days"
              trailing={<Radio value="standard" aria-label="Standard shipping" />}
            >
              Standard shipping
            </ListItem>
            <ListItem
              as="label"
              supportingText="Arrives in 2 days"
              trailing={<Radio value="express" aria-label="Express shipping" />}
            >
              Express shipping
            </ListItem>
            <ListItem
              as="label"
              supportingText="Arrives tomorrow"
              trailing={<Radio value="overnight" aria-label="Overnight shipping" />}
            >
              Overnight shipping
            </ListItem>
          </List>
        </RadioGroup>
      </div>
    </div>
  );
}

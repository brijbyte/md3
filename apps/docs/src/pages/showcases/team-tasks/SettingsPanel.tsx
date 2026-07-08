import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Switch } from "@brijbyte/md3-react/switch";
import { Typography } from "@brijbyte/md3-react/typography";

export function SettingsPanel() {
  return (
    <div className="team-tasks-settings">
      <div>
        <Typography variant="title-medium" className="team-tasks-section-title">
          Notifications
        </Typography>
        <RadioGroup defaultValue="instant" className="team-tasks-radio-group">
          <Typography as="label" variant="body-large" className="team-tasks-radio-label">
            <Radio value="instant" />
            Instant — notify me the moment something changes
          </Typography>
          <Typography as="label" variant="body-large" className="team-tasks-radio-label">
            <Radio value="daily" />
            Daily digest
          </Typography>
          <Typography as="label" variant="body-large" className="team-tasks-radio-label">
            <Radio value="weekly" />
            Weekly digest
          </Typography>
        </RadioGroup>
      </div>

      <div>
        <Typography variant="title-medium" className="team-tasks-section-title">
          Preferences
        </Typography>
        <div className="team-tasks-pref-list">
          <label className="team-tasks-pref-row">
            <Typography variant="body-large">Auto-assign reviewers</Typography>
            <Switch defaultChecked />
          </label>
          <label className="team-tasks-pref-row">
            <Typography variant="body-large">Sync theme across devices</Typography>
            <Switch defaultChecked />
          </label>
          <label className="team-tasks-pref-row">
            <Typography variant="body-large">Email digest</Typography>
            <Switch />
          </label>
        </div>
      </div>
    </div>
  );
}

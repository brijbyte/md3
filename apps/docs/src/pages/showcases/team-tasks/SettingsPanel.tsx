import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Switch } from "@brijbyte/md3-react/switch";
import { Typography } from "@brijbyte/md3-react/typography";

export function SettingsPanel() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Typography variant="title-medium" className="font-bold">
          Notifications
        </Typography>
        <RadioGroup defaultValue="instant" className="mt-3 flex flex-col gap-3">
          <Typography as="label" variant="body-large" className="flex items-center gap-3">
            <Radio value="instant" />
            Instant — notify me the moment something changes
          </Typography>
          <Typography as="label" variant="body-large" className="flex items-center gap-3">
            <Radio value="daily" />
            Daily digest
          </Typography>
          <Typography as="label" variant="body-large" className="flex items-center gap-3">
            <Radio value="weekly" />
            Weekly digest
          </Typography>
        </RadioGroup>
      </div>

      <div>
        <Typography variant="title-medium" className="font-bold">
          Preferences
        </Typography>
        <div className="mt-3 flex flex-col gap-4">
          <label className="flex items-center justify-between gap-4">
            <Typography variant="body-large">Auto-assign reviewers</Typography>
            <Switch defaultChecked />
          </label>
          <label className="flex items-center justify-between gap-4">
            <Typography variant="body-large">Sync theme across devices</Typography>
            <Switch defaultChecked />
          </label>
          <label className="flex items-center justify-between gap-4">
            <Typography variant="body-large">Email digest</Typography>
            <Switch />
          </label>
        </div>
      </div>
    </div>
  );
}

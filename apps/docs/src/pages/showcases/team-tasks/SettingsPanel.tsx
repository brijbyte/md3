import { Divider } from "@brijbyte/md3-react/divider";
import { Radio, RadioGroup } from "@brijbyte/md3-react/radio";
import { Switch } from "@brijbyte/md3-react/switch";
import { Typography } from "@brijbyte/md3-react/typography";

import styles from "./SettingsPanel.module.css";

export function SettingsPanel() {
  return (
    <div className={styles.settings}>
      <div>
        <Typography variant="title-medium" className={styles.sectionTitle}>
          Notifications
        </Typography>
        <RadioGroup defaultValue="instant" className={styles.radioGroup}>
          <Typography as="label" variant="body-large" className={styles.radioLabel}>
            <Radio value="instant" />
            Instant — notify me the moment something changes
          </Typography>
          <Typography as="label" variant="body-large" className={styles.radioLabel}>
            <Radio value="daily" />
            Daily digest
          </Typography>
          <Typography as="label" variant="body-large" className={styles.radioLabel}>
            <Radio value="weekly" />
            Weekly digest
          </Typography>
        </RadioGroup>
      </div>
      <Divider inset />
      <div>
        <Typography variant="title-medium" className={styles.sectionTitle}>
          Preferences
        </Typography>
        <div className={styles.prefList}>
          <label className={styles.prefRow}>
            <Typography variant="body-large">Auto-assign reviewers</Typography>
            <Switch defaultChecked />
          </label>
          <label className={styles.prefRow}>
            <Typography variant="body-large">Sync theme across devices</Typography>
            <Switch defaultChecked />
          </label>
          <label className={styles.prefRow}>
            <Typography variant="body-large">Email digest</Typography>
            <Switch />
          </label>
        </div>
      </div>
    </div>
  );
}

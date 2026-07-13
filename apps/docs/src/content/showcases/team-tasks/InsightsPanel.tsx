"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { CircularProgress } from "@/ui/circular-progress";
import { Divider } from "@/ui/divider";
import { LinearProgress } from "@/ui/linear-progress";
import { Slider } from "@/ui/slider";
import { Typography } from "@/ui/typography";

import shared from "./team-tasks.module.css";
import styles from "./InsightsPanel.module.css";

const BUDGET_MAX = 20_000;
const CAPACITY_MIN = 0;
const CAPACITY_MAX = 120;
const VELOCITY_MIN = 0;
const VELOCITY_MAX = 100;

export function InsightsPanel() {
  const [capacity, setCapacity] = React.useState<number[]>([20, 80]);
  const [velocity, setVelocity] = React.useState(65);
  const budgetSpent = Math.round((BUDGET_MAX * 42) / 100);

  return (
    <div className={styles.insights}>
      <div className={styles.statGrid}>
        <Card className={`${styles.statCard} ${styles.statCardProgress}`}>
          <CircularProgress value={68} aria-label="Sprint progress" />
          <Typography variant="label-large">Sprint progress</Typography>
        </Card>
        <Card className={styles.statCard}>
          {/* This is app UI, not a doc page — Roboto (plain) over display-small's brand default. */}
          <Typography variant="display-small" className={shared.display}>
            12
          </Typography>
          <Typography variant="label-large" className={shared.muted}>
            Tasks completed
          </Typography>
        </Card>
        <Card className={styles.statCard}>
          <Typography variant="display-small" className={shared.display}>
            4
          </Typography>
          <Typography variant="label-large" className={shared.muted}>
            Blocked
          </Typography>
        </Card>
      </div>

      <div>
        <Typography variant="label-large" className={shared.muted}>
          Budget used: ${budgetSpent.toLocaleString()} of ${BUDGET_MAX.toLocaleString()}
        </Typography>
        <div className={`${styles.metricRow} ${styles.metricRowTight}`}>
          <Typography variant="label-small" className={shared.muted}>
            $0
          </Typography>
          <LinearProgress value={42} aria-label="Budget used" className={shared.fill} />
          <Typography variant="label-small" className={shared.muted}>
            ${BUDGET_MAX.toLocaleString()}
          </Typography>
        </div>
      </div>

      <Divider inset />

      <div>
        <Typography variant="label-large" className={shared.muted}>
          Team capacity range: {capacity[0]}–{capacity[1]} pts
        </Typography>
        <div className={styles.metricRow}>
          <Typography variant="label-small" className={shared.muted}>
            {CAPACITY_MIN}
          </Typography>
          <Slider
            className={shared.fill}
            min={CAPACITY_MIN}
            max={CAPACITY_MAX}
            getAriaLabel={(index) => (index === 0 ? "Minimum capacity" : "Maximum capacity")}
            value={capacity}
            onValueChange={(value) => setCapacity(value as number[])}
          />
          <Typography variant="label-small" className={shared.muted}>
            {CAPACITY_MAX} pts
          </Typography>
        </div>
      </div>

      <Divider inset />

      <div>
        <Typography variant="label-large" className={shared.muted}>
          Velocity target: {velocity} pts/sprint
        </Typography>
        <div className={styles.metricRow}>
          <Typography variant="label-small" className={shared.muted}>
            {VELOCITY_MIN}
          </Typography>
          <Slider
            className={shared.fill}
            min={VELOCITY_MIN}
            max={VELOCITY_MAX}
            aria-label="Velocity target"
            value={velocity}
            onValueChange={(value) => setVelocity(value as number)}
          />
          <Typography variant="label-small" className={shared.muted}>
            {VELOCITY_MAX} pts
          </Typography>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Card } from "@brijbyte/md3-react/card";
import { CircularProgress } from "@brijbyte/md3-react/circular-progress";
import { LinearProgress } from "@brijbyte/md3-react/linear-progress";
import { Slider } from "@brijbyte/md3-react/slider";
import { Typography } from "@brijbyte/md3-react/typography";

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
    <div className="team-tasks-insights">
      <div className="team-tasks-stat-grid">
        <Card className="team-tasks-stat-card team-tasks-stat-card--progress">
          <CircularProgress value={68} aria-label="Sprint progress" />
          <Typography variant="label-large">Sprint progress</Typography>
        </Card>
        <Card className="team-tasks-stat-card">
          {/* This is app UI, not a doc page — Roboto (plain) over display-small's brand default. */}
          <Typography variant="display-small" className="team-tasks-display">
            12
          </Typography>
          <Typography variant="label-large" className="team-tasks-muted">
            Tasks completed
          </Typography>
        </Card>
        <Card className="team-tasks-stat-card">
          <Typography variant="display-small" className="team-tasks-display">
            4
          </Typography>
          <Typography variant="label-large" className="team-tasks-muted">
            Blocked
          </Typography>
        </Card>
      </div>

      <div>
        <Typography variant="label-large" className="team-tasks-muted">
          Budget used: ${budgetSpent.toLocaleString()} of ${BUDGET_MAX.toLocaleString()}
        </Typography>
        <div className="team-tasks-metric-row team-tasks-metric-row--tight">
          <Typography variant="label-small" className="team-tasks-muted">
            $0
          </Typography>
          <LinearProgress value={42} aria-label="Budget used" className="team-tasks-fill" />
          <Typography variant="label-small" className="team-tasks-muted">
            ${BUDGET_MAX.toLocaleString()}
          </Typography>
        </div>
      </div>

      <div>
        <Typography variant="label-large" className="team-tasks-muted">
          Team capacity range: {capacity[0]}–{capacity[1]} pts
        </Typography>
        <div className="team-tasks-metric-row">
          <Typography variant="label-small" className="team-tasks-muted">
            {CAPACITY_MIN}
          </Typography>
          <Slider
            className="team-tasks-fill"
            min={CAPACITY_MIN}
            max={CAPACITY_MAX}
            getAriaLabel={(index) => (index === 0 ? "Minimum capacity" : "Maximum capacity")}
            value={capacity}
            onValueChange={(value) => setCapacity(value as number[])}
          />
          <Typography variant="label-small" className="team-tasks-muted">
            {CAPACITY_MAX} pts
          </Typography>
        </div>
      </div>

      <div>
        <Typography variant="label-large" className="team-tasks-muted">
          Velocity target: {velocity} pts/sprint
        </Typography>
        <div className="team-tasks-metric-row">
          <Typography variant="label-small" className="team-tasks-muted">
            {VELOCITY_MIN}
          </Typography>
          <Slider
            className="team-tasks-fill"
            min={VELOCITY_MIN}
            max={VELOCITY_MAX}
            aria-label="Velocity target"
            value={velocity}
            onValueChange={(value) => setVelocity(value as number)}
          />
          <Typography variant="label-small" className="team-tasks-muted">
            {VELOCITY_MAX} pts
          </Typography>
        </div>
      </div>
    </div>
  );
}

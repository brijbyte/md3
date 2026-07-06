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
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col items-center gap-2 p-6">
          <CircularProgress value={68} aria-label="Sprint progress" wavy />
          <Typography variant="label-large">Sprint progress</Typography>
        </Card>
        <Card className="flex flex-col justify-center gap-2 p-6">
          {/* This is app UI, not a doc page — Roboto (plain) over display-small's brand default. */}
          <Typography variant="display-small" className="font-plain font-bold">
            12
          </Typography>
          <Typography variant="label-large" className="text-on-surface-variant">
            Tasks completed
          </Typography>
        </Card>
        <Card className="flex flex-col justify-center gap-2 p-6">
          <Typography variant="display-small" className="font-plain font-bold">
            4
          </Typography>
          <Typography variant="label-large" className="text-on-surface-variant">
            Blocked
          </Typography>
        </Card>
      </div>

      <div>
        <Typography variant="label-large" className="text-on-surface-variant">
          Budget used: ${budgetSpent.toLocaleString()} of ${BUDGET_MAX.toLocaleString()}
        </Typography>
        <div className="mt-2 flex items-center gap-3">
          <Typography variant="label-small" className="text-on-surface-variant">
            $0
          </Typography>
          <LinearProgress value={42} aria-label="Budget used" className="flex-1" />
          <Typography variant="label-small" className="text-on-surface-variant">
            ${BUDGET_MAX.toLocaleString()}
          </Typography>
        </div>
      </div>

      <div>
        <Typography variant="label-large" className="text-on-surface-variant">
          Team capacity range: {capacity[0]}–{capacity[1]} pts
        </Typography>
        <div className="mt-4 flex items-center gap-3">
          <Typography variant="label-small" className="text-on-surface-variant">
            {CAPACITY_MIN}
          </Typography>
          <Slider
            className="flex-1"
            min={CAPACITY_MIN}
            max={CAPACITY_MAX}
            getAriaLabel={(index) => (index === 0 ? "Minimum capacity" : "Maximum capacity")}
            value={capacity}
            onValueChange={(value) => setCapacity(value as number[])}
          />
          <Typography variant="label-small" className="text-on-surface-variant">
            {CAPACITY_MAX} pts
          </Typography>
        </div>
      </div>

      <div>
        <Typography variant="label-large" className="text-on-surface-variant">
          Velocity target: {velocity} pts/sprint
        </Typography>
        <div className="mt-4 flex items-center gap-3">
          <Typography variant="label-small" className="text-on-surface-variant">
            {VELOCITY_MIN}
          </Typography>
          <Slider
            className="flex-1"
            min={VELOCITY_MIN}
            max={VELOCITY_MAX}
            aria-label="Velocity target"
            value={velocity}
            onValueChange={(value) => setVelocity(value as number)}
          />
          <Typography variant="label-small" className="text-on-surface-variant">
            {VELOCITY_MAX} pts
          </Typography>
        </div>
      </div>
    </div>
  );
}

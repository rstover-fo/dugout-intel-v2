"use client";

import { REST_TIERS, DAILY_PITCH_MAX } from "@/lib/baseball";

interface ProgressBarProps {
  current: number;
  max?: number;
}

export function ProgressBar({ current, max = DAILY_PITCH_MAX }: ProgressBarProps) {
  const pct = Math.min((current / max) * 100, 100);
  const color = current >= 65
    ? "bg-fatigue-high"
    : current >= 50
      ? "bg-fatigue-med"
      : "bg-dugout-field";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">pitch_count</span>
        <span className="font-semibold text-foreground">{current} / {max}</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded bg-secondary">
        <div
          className={`h-full rounded transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
        {REST_TIERS.map((tier) => (
          <div
            key={tier.max}
            className="absolute top-0 h-full w-px bg-foreground/10"
            style={{ left: `${(tier.max / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

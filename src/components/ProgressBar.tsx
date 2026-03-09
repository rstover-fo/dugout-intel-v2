"use client";

import { REST_TIERS, DAILY_PITCH_MAX } from "@/lib/baseball";

interface ProgressBarProps {
  current: number;
  max?: number;
}

export function ProgressBar({ current, max = DAILY_PITCH_MAX }: ProgressBarProps) {
  const pct = Math.min((current / max) * 100, 100);
  const color = current >= 65 ? "bg-red-500" : current >= 50 ? "bg-orange-500" : current >= 35 ? "bg-yellow-500" : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{current}p</span>
        <span>{max}p max</span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
        {REST_TIERS.map((tier) => (
          <div
            key={tier.max}
            className="absolute top-0 h-full w-px bg-foreground/20"
            style={{ left: `${(tier.max / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        {REST_TIERS.map((tier) => (
          <span key={tier.max}>{tier.max}</span>
        ))}
      </div>
    </div>
  );
}

"use client";

interface VeloChartProps {
  velocities: number[];
  maxVelo?: number;
}

export function VeloChart({ velocities, maxVelo = 75 }: VeloChartProps) {
  if (velocities.length === 0) {
    return <div className="text-sm text-muted-foreground">No velocity data</div>;
  }

  const peak = Math.max(...velocities);
  const displayMax = Math.max(maxVelo, peak + 5);

  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">Velocity Trend</div>
      <div className="flex items-end gap-0.5" style={{ height: 60 }}>
        {velocities.map((v, i) => {
          const height = (v / displayMax) * 100;
          const isRecent = i >= velocities.length - 5;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all ${isRecent ? "bg-emerald-400" : "bg-muted-foreground/30"}`}
              style={{ height: `${height}%`, minWidth: 4, maxWidth: 12 }}
              title={`${v} mph`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Peak: {peak}</span>
        <span>Last: {velocities[velocities.length - 1]}</span>
      </div>
    </div>
  );
}

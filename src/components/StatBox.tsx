"use client";

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}

export function StatBox({ label, value, color, sub }: StatBoxProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold" style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

"use client";

interface StatBoxProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  sub?: string;
}

export function StatBox({ label, value, highlight, sub }: StatBoxProps) {
  return (
    <div className="rounded-lg bg-dugout-surface-elevated p-4 text-center">
      <div className="text-2xl font-bold" style={highlight ? { color: "hsl(var(--primary))" } : undefined}>
        {value}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

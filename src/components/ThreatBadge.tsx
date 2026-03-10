"use client";

interface ThreatBadgeProps {
  threat: string;
}

const threatStyles: Record<string, string> = {
  elite: "bg-destructive/15 text-destructive",
  high: "bg-destructive/15 text-destructive",
  medium: "bg-fatigue-med/15 text-fatigue-med",
  low: "bg-muted text-muted-foreground",
};

export function ThreatBadge({ threat }: ThreatBadgeProps) {
  const style = threatStyles[threat] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${style}`}>
      {threat}
    </span>
  );
}

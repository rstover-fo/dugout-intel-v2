"use client";

import { Badge } from "@/components/ui/badge";

interface ThreatBadgeProps {
  threat: string;
}

const threatStyles: Record<string, string> = {
  elite: "bg-red-600 text-white border-red-600",
  high: "bg-orange-500 text-white border-orange-500",
  medium: "bg-yellow-500 text-black border-yellow-500",
  low: "bg-emerald-600 text-white border-emerald-600",
};

export function ThreatBadge({ threat }: ThreatBadgeProps) {
  const style = threatStyles[threat] ?? "bg-muted text-muted-foreground";
  return (
    <Badge className={style}>
      {threat.toUpperCase()}
    </Badge>
  );
}

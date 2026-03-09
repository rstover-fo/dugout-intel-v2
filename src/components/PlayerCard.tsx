"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThreatBadge } from "./ThreatBadge";
import { ResultPills } from "./ResultPills";

interface PlayerCardProps {
  name: string;
  number: string;
  position: string;
  threat?: string;
  notes?: string;
  defenseNotes?: string;
  results?: string[];
  expanded?: boolean;
  onToggle?: () => void;
}

export function PlayerCard({
  name,
  number,
  position,
  threat,
  notes,
  defenseNotes,
  results,
  expanded,
  onToggle,
}: PlayerCardProps) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={onToggle}>
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground">#{number}</span>
          <CardTitle className="text-sm">{name}</CardTitle>
          <span className="text-xs text-muted-foreground">{position}</span>
        </div>
        {threat && <ThreatBadge threat={threat} />}
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-2 p-3 pt-0">
          {results && results.length > 0 && <ResultPills results={results} />}
          {notes && (
            <div>
              <div className="text-xs font-medium text-muted-foreground">Approach</div>
              <div className="text-xs">{notes}</div>
            </div>
          )}
          {defenseNotes && (
            <div>
              <div className="text-xs font-medium text-muted-foreground">Defense</div>
              <div className="text-xs">{defenseNotes}</div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

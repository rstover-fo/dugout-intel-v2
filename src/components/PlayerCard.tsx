"use client";

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
    <div
      className="cursor-pointer rounded-lg border border-border bg-dugout-surface-elevated transition-colors hover:border-primary/30"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">#{number}</span>
          <span className="text-[11px] text-foreground">
            {name.toLowerCase().replace(/\s+/g, "_")}
          </span>
          <span className="text-[10px] text-muted-foreground">{position}</span>
        </div>
        <div className="flex items-center gap-2">
          {threat && <ThreatBadge threat={threat} />}
          <span className="text-[10px] text-muted-foreground">
            {expanded ? "[-]" : "[+]"}
          </span>
        </div>
      </div>
      {expanded && (
        <div className="space-y-3 border-t border-border px-4 py-3">
          {results && results.length > 0 && (
            <div>
              <div className="mb-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                {"// "}results
              </div>
              <ResultPills results={results} />
            </div>
          )}
          {notes && (
            <div>
              <div className="mb-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                {"// "}approach
              </div>
              <div className="text-[11px] text-foreground">{notes}</div>
            </div>
          )}
          {defenseNotes && (
            <div>
              <div className="mb-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                {"// "}defense
              </div>
              <div className="text-[11px] text-foreground">{defenseNotes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

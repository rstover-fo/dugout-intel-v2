"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const QUICK_ALERTS = [
  "Move up in box",
  "Slide step!",
  "Mound visit",
  "Be patient",
  "Steal next pitch",
  "Warm someone up",
  "Infield in",
];

interface CoachTabProps {
  messages: string[];
  gameId: Id<"games">;
  teamId: Id<"teams">;
  game: { opponent: string; ourScore: number; theirScore: number; inning: number };
}

export function CoachTab({ messages, gameId, teamId, game }: CoachTabProps) {
  const pitchingStats = useQuery(api.pitching.getStats, { gameId, teamId });

  function buildExport(): string {
    const lines: string[] = [];
    lines.push(`GAME vs ${game.opponent}`);
    lines.push(`Score: ${game.ourScore}-${game.theirScore} (Inn ${game.inning})`);
    lines.push("");

    if (pitchingStats) {
      lines.push("PITCHING:");
      for (const app of pitchingStats) {
        lines.push(`  ${app.playerName}: ${app.pitchCount}p (Inn ${app.startInning}${app.endInning ? `-${app.endInning}` : "+"})`);
        if (app.report) lines.push(`    Report: ${app.report}`);
      }
      lines.push("");
    }

    if (messages.length > 0) {
      lines.push("ALERTS:");
      messages.forEach((m) => lines.push(`  - ${m}`));
    }

    return lines.join("\n");
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildExport());
  }

  function handleDownload() {
    const blob = new Blob([buildExport()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `game-${game.opponent}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Quick Alerts */}
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">Quick Alerts</div>
        <div className="flex flex-wrap gap-1">
          {QUICK_ALERTS.map((alert) => (
            <Button key={alert} variant="outline" size="sm" className="text-xs">
              {alert}
            </Button>
          ))}
        </div>
      </div>

      {/* Auto Messages */}
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          Auto Messages ({messages.length})
        </div>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground">No messages yet.</p>
          )}
          {messages.map((msg, i) => (
            <Card key={i}>
              <CardContent className="p-2 text-xs">{msg}</CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          Copy Report
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          Download .txt
        </Button>
      </div>
    </div>
  );
}

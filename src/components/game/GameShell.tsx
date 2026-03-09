"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PitchingTab } from "./PitchingTab";
import { LineupTab } from "./LineupTab";
import { ScoutingTab } from "./ScoutingTab";
import { IntelTab } from "./IntelTab";
import { CoachTab } from "./CoachTab";
import { FeedTab } from "./FeedTab";
import { useState } from "react";

interface GameShellProps {
  gameId: Id<"games">;
  teamId: Id<"teams">;
}

export function GameShell({ gameId, teamId }: GameShellProps) {
  const game = useQuery(api.games.getGame, { gameId, teamId });
  const updateScore = useMutation(api.games.updateScore);
  const updateInning = useMutation(api.games.updateInning);
  const [alerts, setAlerts] = useState<{ message: string; severity: string; ts: number }[]>([]);
  const [coachMessages, setCoachMessages] = useState<string[]>([]);

  function addAlert(message: string, severity: string) {
    setAlerts((prev) => [{ message, severity, ts: Date.now() }, ...prev]);
  }

  function addCoachMessage(msg: string) {
    setCoachMessages((prev) => [msg, ...prev]);
  }

  if (!game) return <div className="p-4 text-sm text-muted-foreground">Loading game...</div>;

  return (
    <div className="space-y-3 p-4">
      {/* Scoreboard Header */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">US</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateScore({ gameId, teamId, side: "us", delta: -1 })}>-</Button>
            <span className="min-w-[24px] text-center text-lg font-bold">{game.ourScore}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateScore({ gameId, teamId, side: "us", delta: 1 })}>+</Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-muted-foreground">{game.opponent.slice(0, 6).toUpperCase()}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateScore({ gameId, teamId, side: "them", delta: -1 })}>-</Button>
            <span className="min-w-[24px] text-center text-lg font-bold">{game.theirScore}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateScore({ gameId, teamId, side: "them", delta: 1 })}>+</Button>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateInning({ gameId, teamId, inning: Math.max(1, game.inning - 1) })}>-</Button>
            <span className="text-sm font-medium">Inn {game.inning}</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => updateInning({ gameId, teamId, inning: game.inning + 1 })}>+</Button>
          </div>
          <div className="text-xs text-emerald-400">LIVE</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="pitch" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="pitch" className="text-xs">Pitch</TabsTrigger>
          <TabsTrigger value="lineup" className="text-xs">Lineup</TabsTrigger>
          <TabsTrigger value="scout" className="text-xs">Scout</TabsTrigger>
          <TabsTrigger value="intel" className="text-xs">Intel</TabsTrigger>
          <TabsTrigger value="coach" className="text-xs">
            Coach{coachMessages.length > 0 && <span className="ml-1 text-[10px] text-emerald-400">{coachMessages.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="feed" className="text-xs">
            Feed{alerts.length > 0 && <span className="ml-1 text-[10px] text-red-400">{alerts.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="manage" className="text-xs">Mgmt</TabsTrigger>
        </TabsList>

        <TabsContent value="pitch">
          <PitchingTab gameId={gameId} teamId={teamId} game={game} onAlert={addAlert} onCoachMessage={addCoachMessage} />
        </TabsContent>
        <TabsContent value="lineup">
          <LineupTab gameId={gameId} teamId={teamId} game={game} />
        </TabsContent>
        <TabsContent value="scout">
          <ScoutingTab gameId={gameId} teamId={teamId} game={game} />
        </TabsContent>
        <TabsContent value="intel">
          <IntelTab teamId={teamId} />
        </TabsContent>
        <TabsContent value="coach">
          <CoachTab messages={coachMessages} gameId={gameId} teamId={teamId} game={game} />
        </TabsContent>
        <TabsContent value="feed">
          <FeedTab alerts={alerts} />
        </TabsContent>
        <TabsContent value="manage">
          <div className="text-sm text-muted-foreground">
            <p>Game management available from team page.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

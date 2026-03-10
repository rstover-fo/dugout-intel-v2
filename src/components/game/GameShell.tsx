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
import Link from "next/link";

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

  if (!game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-xs text-muted-foreground">loading game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar — Score + Inning */}
      <header className="flex items-center justify-between border-b border-border bg-dugout-surface px-6 py-3">
        <Link href={`/team/${teamId}`} className="text-xs text-primary hover:text-primary/80 transition-colors">
          {"<< "}team
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-foreground">
            {game.opponent ? `vs ${game.opponent.toLowerCase().replace(/\s+/g, "_")}` : "game"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Score */}
          <div className="flex items-center gap-1 rounded-md bg-secondary px-3 py-1">
            <span className="text-lg font-bold text-primary">{game.ourScore}</span>
            <span className="text-xs text-muted-foreground">-</span>
            <span className="text-lg font-bold text-muted-foreground">{game.theirScore}</span>
          </div>
          {/* Inning Badge */}
          <span className="rounded bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            inn {game.inning}
          </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <Tabs defaultValue="pitch" className="w-full">
        <div className="border-b border-border bg-dugout-surface">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent px-6">
            {[
              { value: "pitch", label: "pitching" },
              { value: "lineup", label: "lineup" },
              { value: "scout", label: "scouting" },
              { value: "intel", label: "intel" },
              { value: "coach", label: "coach", badge: coachMessages.length || undefined },
              { value: "feed", label: "feed", badge: alerts.length || undefined, badgeColor: "text-destructive" },
              { value: "manage", label: "manage" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-[11px] text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-none"
              >
                {tab.label}
                {tab.badge ? (
                  <span className={`ml-1.5 text-[9px] ${tab.badgeColor ?? "text-primary"}`}>
                    {tab.badge}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-6">
          <TabsContent value="pitch" className="mt-0">
            <PitchingTab gameId={gameId} teamId={teamId} game={game} onAlert={addAlert} onCoachMessage={addCoachMessage} />
          </TabsContent>
          <TabsContent value="lineup" className="mt-0">
            <LineupTab gameId={gameId} teamId={teamId} game={game} />
          </TabsContent>
          <TabsContent value="scout" className="mt-0">
            <ScoutingTab gameId={gameId} teamId={teamId} game={game} />
          </TabsContent>
          <TabsContent value="intel" className="mt-0">
            <IntelTab teamId={teamId} />
          </TabsContent>
          <TabsContent value="coach" className="mt-0">
            <CoachTab messages={coachMessages} gameId={gameId} teamId={teamId} game={game} />
          </TabsContent>
          <TabsContent value="feed" className="mt-0">
            <FeedTab alerts={alerts} />
          </TabsContent>
          <TabsContent value="manage" className="mt-0">
            {/* Manage Tab — Score + Inning Controls */}
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{"> "}game_controls</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-dugout-surface-elevated p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">{"// "}our_score</p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => updateScore({ gameId, teamId, side: "us", delta: -1 })}>-</Button>
                    <span className="min-w-[40px] text-center text-2xl font-bold text-primary">{game.ourScore}</span>
                    <Button variant="outline" size="sm" onClick={() => updateScore({ gameId, teamId, side: "us", delta: 1 })}>+</Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-dugout-surface-elevated p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">{"// "}their_score</p>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => updateScore({ gameId, teamId, side: "them", delta: -1 })}>-</Button>
                    <span className="min-w-[40px] text-center text-2xl font-bold text-muted-foreground">{game.theirScore}</span>
                    <Button variant="outline" size="sm" onClick={() => updateScore({ gameId, teamId, side: "them", delta: 1 })}>+</Button>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-dugout-surface-elevated p-4 space-y-3">
                <p className="text-xs text-muted-foreground">{"// "}inning</p>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => updateInning({ gameId, teamId, inning: Math.max(1, game.inning - 1) })}>-</Button>
                  <span className="min-w-[40px] text-center text-2xl font-bold text-foreground">{game.inning}</span>
                  <Button variant="outline" size="sm" onClick={() => updateInning({ gameId, teamId, inning: game.inning + 1 })}>+</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

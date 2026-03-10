"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function TeamHomePage() {
  const params = useParams();
  const teamId = params.teamId as Id<"teams">;
  const team = useQuery(api.teams.getTeam, { teamId });
  const roster = useQuery(api.players.getRoster, { teamId });
  const pitchers = useQuery(api.pitching.getStaffAvailability, { teamId });
  const liveGame = useQuery(api.games.getLive, { teamId });
  const seedRoster = useMutation(api.seed.seedRoster);
  const [seeding, setSeeding] = useState(false);

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-xs text-muted-foreground">loading...</p>
      </div>
    );
  }

  const teamSlug = team.name.toLowerCase().replace(/\s+/g, "_");

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border bg-dugout-surface px-6 py-3">
        <Link href="/" className="text-xs text-primary hover:text-primary/80 transition-colors">
          {"<< "}teams
        </Link>
        <span className="text-xs text-muted-foreground">{"> "}dugout_intel</span>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {/* Team Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {team.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">{teamSlug}</h1>
              <p className="text-xs text-muted-foreground">
                {team.season} · {roster?.length ?? 0} players
              </p>
            </div>
          </div>
          <Link href={`/team/${teamId}/game/new`}>
            <Button size="sm">$ start_game</Button>
          </Link>
        </div>

        {/* Live Game Banner */}
        {liveGame && (
          <Link href={`/team/${teamId}/game/${liveGame._id}`}>
            <div className="flex items-center justify-between rounded-lg bg-primary/10 border border-primary/20 px-5 py-3 transition-colors hover:bg-primary/15">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">live</span>
                <span className="text-sm text-primary/80">
                  vs {liveGame.opponent} — {liveGame.ourScore}-{liveGame.theirScore} (Inn {liveGame.inning})
                </span>
              </div>
              <span className="text-[11px] font-semibold text-primary">resume {">"}</span>
            </div>
          </Link>
        )}

        {/* Two Column Layout */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Roster */}
          <div className="overflow-hidden rounded-lg border border-border bg-dugout-surface-elevated">
            <div className="flex items-center justify-between bg-secondary px-4 py-2.5">
              <span className="text-xs font-semibold text-foreground">{"> "}roster ({roster?.length ?? 0})</span>
              <Link href={`/team/${teamId}/roster`} className="text-[10px] text-primary hover:text-primary/80">
                manage {">>"}
              </Link>
            </div>
            <div className="divide-y divide-border">
              {roster?.slice(0, 6).map((p) => (
                <div key={p._id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[11px] text-foreground">
                    <span className="text-primary font-semibold">#{p.number}</span>{" "}{p.name.toLowerCase().replace(/\s+/g, "_")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{p.position}</span>
                </div>
              ))}
              {roster?.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <p className="mb-3 text-xs text-muted-foreground">{"// "}empty roster</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={seeding}
                    onClick={async () => {
                      setSeeding(true);
                      await seedRoster({ teamId });
                      setSeeding(false);
                    }}
                  >
                    {seeding ? "seeding..." : "seed_demo_roster"}
                  </Button>
                </div>
              )}
              {(roster?.length ?? 0) > 6 && (
                <div className="px-4 py-2 text-center">
                  <span className="text-[10px] text-muted-foreground">
                    {"// "}+{(roster?.length ?? 0) - 6} more
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pitching Staff */}
          <div className="overflow-hidden rounded-lg border border-border bg-dugout-surface-elevated">
            <div className="flex items-center justify-between bg-secondary px-4 py-2.5">
              <span className="text-xs font-semibold text-foreground">{"> "}pitching_staff</span>
              <span className="text-[10px] text-muted-foreground">availability</span>
            </div>
            <div className="divide-y divide-border">
              {pitchers?.map((p) => (
                <div key={p.playerId} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-[11px] text-foreground">
                    <span className="text-primary font-semibold">#{p.number}</span>{" "}{p.name.toLowerCase().replace(/\s+/g, "_")}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">
                      {p.pitching.ppi.toFixed(1)} P/IP | {p.pitching.fps.toFixed(0)}% FPS
                    </span>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
                      ready
                    </span>
                  </div>
                </div>
              ))}
              {(!pitchers || pitchers.length === 0) && (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-muted-foreground">{"// "}no pitchers on staff</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href={`/team/${teamId}/roster`}>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-dugout-surface-elevated px-4 py-5 transition-colors hover:border-primary/30">
              <span className="text-lg text-muted-foreground">[]</span>
              <span className="text-[11px] text-muted-foreground">roster</span>
            </div>
          </Link>
          <Link href={`/team/${teamId}/scouting`}>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-dugout-surface-elevated px-4 py-5 transition-colors hover:border-primary/30">
              <span className="text-lg text-muted-foreground">{"{}"}</span>
              <span className="text-[11px] text-muted-foreground">scouting</span>
            </div>
          </Link>
          <Link href={`/team/${teamId}/game/new`}>
            <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-dugout-surface-elevated px-4 py-5 transition-colors hover:border-primary/30">
              <span className="text-lg text-muted-foreground">{"//"}</span>
              <span className="text-[11px] text-muted-foreground">new_game</span>
            </div>
          </Link>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-dugout-surface-elevated px-4 py-5 opacity-50">
            <span className="text-lg text-muted-foreground">#</span>
            <span className="text-[11px] text-muted-foreground">pitch_budgets</span>
          </div>
        </div>
      </div>
    </main>
  );
}

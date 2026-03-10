"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  if (!team) return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{team.name}</h1>
          <p className="text-xs text-muted-foreground">{team.season}</p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">Back</Button>
        </Link>
      </div>

      {liveGame && (
        <Link href={`/team/${teamId}/game/${liveGame._id}`}>
          <Card className="border-emerald-500 bg-emerald-500/10">
            <CardHeader className="p-3">
              <CardTitle className="text-sm text-emerald-400">
                LIVE: vs {liveGame.opponent} — {liveGame.ourScore}-{liveGame.theirScore} (Inn {liveGame.inning})
              </CardTitle>
            </CardHeader>
          </Card>
        </Link>
      )}

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Roster ({roster?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            {roster?.map((p) => (
              <div key={p._id} className="flex justify-between text-xs">
                <span>#{p.number} {p.name}</span>
                <span className="text-muted-foreground">{p.position}</span>
              </div>
            ))}
          </div>
          <Link href={`/team/${teamId}/roster`}>
            <Button variant="outline" size="sm" className="mt-2 w-full">Manage Roster</Button>
          </Link>
          {roster?.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              disabled={seeding}
              onClick={async () => {
                setSeeding(true);
                await seedRoster({ teamId });
                setSeeding(false);
              }}
            >
              {seeding ? "Seeding..." : "Seed Demo Roster"}
            </Button>
          )}
        </CardContent>
      </Card>

      {pitchers && pitchers.length > 0 && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Pitching Staff</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1">
            {pitchers.map((p) => (
              <div key={p.playerId} className="flex justify-between text-xs">
                <span>#{p.number} {p.name}</span>
                <span className="text-muted-foreground">
                  {p.pitching.ppi.toFixed(1)} P/IP | {p.pitching.fps.toFixed(0)}% FPS
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Link href={`/team/${teamId}/game/new`} className="flex-1">
          <Button className="w-full">Start Game</Button>
        </Link>
        <Link href={`/team/${teamId}/scouting`} className="flex-1">
          <Button variant="outline" className="w-full">Scouting</Button>
        </Link>
      </div>
    </div>
  );
}

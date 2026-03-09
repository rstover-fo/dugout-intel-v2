"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function NewGamePage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as Id<"teams">;
  const opponentTeams = useQuery(api.players.listOpponentTeams, { teamId });
  const roster = useQuery(api.players.getRoster, { teamId });
  const createGame = useMutation(api.games.create);
  const startGame = useMutation(api.games.start);
  const switchPitcher = useMutation(api.pitching.switchPitcher);

  const [opponent, setOpponent] = useState("");
  const [customOpponent, setCustomOpponent] = useState("");
  const [startingPitcher, setStartingPitcher] = useState<Id<"players"> | "">("");

  const pitchers = roster?.filter((p) => p.seasonStats?.pitching);
  const effectiveOpponent = opponent === "__custom" ? customOpponent : opponent;

  async function handleStart() {
    if (!effectiveOpponent.trim()) return;
    const gameId = await createGame({ teamId, opponent: effectiveOpponent.trim() });
    await startGame({ gameId, teamId });
    if (startingPitcher) {
      await switchPitcher({ gameId, teamId, newPitcherId: startingPitcher as Id<"players">, inning: 1 });
    }
    router.push(`/team/${teamId}/game/${gameId}`);
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-lg font-bold">Pre-Game Setup</h1>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Opponent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <Select value={opponent} onValueChange={setOpponent}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select opponent" />
            </SelectTrigger>
            <SelectContent>
              {opponentTeams?.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
              <SelectItem value="__custom">Other...</SelectItem>
            </SelectContent>
          </Select>
          {opponent === "__custom" && (
            <Input
              placeholder="Opponent name"
              value={customOpponent}
              onChange={(e) => setCustomOpponent(e.target.value)}
              className="h-8 text-xs"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Starting Pitcher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          {pitchers?.map((p) => (
            <Button
              key={p._id}
              variant={startingPitcher === p._id ? "default" : "outline"}
              size="sm"
              className="mr-2 mb-1"
              onClick={() => setStartingPitcher(p._id)}
            >
              #{p.number} {p.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {roster && (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Lineup ({roster.length} players)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {roster.map((p, i) => (
              <div key={p._id} className="flex justify-between text-xs py-0.5">
                <span>{i + 1}. #{p.number} {p.name}</span>
                <span className="text-muted-foreground">{p.position}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleStart}
          disabled={!effectiveOpponent.trim()}
        >
          Start Game
        </Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutcomeButtons } from "@/components/OutcomeButtons";
import { ResultPills } from "@/components/ResultPills";
import { calcPct, arrayAvg, arrayPeak, BATTER_OUTCOMES, type AtBatResult } from "@/lib/baseball";
import { useState } from "react";

interface LineupTabProps {
  gameId: Id<"games">;
  teamId: Id<"teams">;
  game: { inning: number; opponent: string };
}

export function LineupTab({ gameId, teamId, game }: LineupTabProps) {
  const roster = useQuery(api.players.getRoster, { teamId });
  const atBatResults = useQuery(api.lineup.getAtBatResults, { gameId, teamId });
  const opponentPitchers = useQuery(api.lineup.getOpponentPitcher, { gameId, teamId });
  const logAtBat = useMutation(api.lineup.logAtBat);
  const logOpponentPitch = useMutation(api.lineup.logOpponentPitch);

  const [oppPitcherName, setOppPitcherName] = useState("");
  const [oppVeloInput, setOppVeloInput] = useState("");
  const [selectedBatter, setSelectedBatter] = useState<Id<"players"> | null>(null);

  async function handleLogAtBat(result: AtBatResult) {
    if (!selectedBatter) return;
    await logAtBat({ gameId, teamId, playerId: selectedBatter, result });
    setSelectedBatter(null);
  }

  async function handleOppPitch(isStrike: boolean) {
    if (!oppPitcherName.trim()) return;
    const velo = oppVeloInput ? parseFloat(oppVeloInput) : undefined;
    await logOpponentPitch({ gameId, teamId, pitcherName: oppPitcherName.trim(), isStrike, velocity: velo });
    setOppVeloInput("");
  }

  const activePitcher = opponentPitchers?.[opponentPitchers.length - 1];

  return (
    <div className="space-y-4">
      {/* Opponent Pitcher Tracker */}
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Opponent Pitcher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <Input
            placeholder="Pitcher name"
            value={oppPitcherName}
            onChange={(e) => setOppPitcherName(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Velo"
              value={oppVeloInput}
              onChange={(e) => setOppVeloInput(e.target.value)}
              className="h-8 w-20 text-xs"
            />
            <Button size="sm" className="bg-emerald-600" onClick={() => handleOppPitch(true)}>S</Button>
            <Button size="sm" className="bg-red-600" onClick={() => handleOppPitch(false)}>B</Button>
          </div>
          {activePitcher && (
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{activePitcher.pitcherName}</span>
              <span>K%: {calcPct(activePitcher.strikes, activePitcher.strikes + activePitcher.balls)}%</span>
              <span>Avg: {arrayAvg(activePitcher.velocities)}</span>
              <span>Peak: {arrayPeak(activePitcher.velocities)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Our Batting Order */}
      <div>
        <div className="mb-2 text-xs font-medium text-muted-foreground">Our Lineup</div>
        {selectedBatter && (
          <div className="mb-3">
            <div className="mb-1 text-xs">Record result for #{roster?.find((r) => r._id === selectedBatter)?.number}:</div>
            <OutcomeButtons outcomes={BATTER_OUTCOMES} onSelect={handleLogAtBat} />
            <Button variant="ghost" size="sm" className="mt-1" onClick={() => setSelectedBatter(null)}>Cancel</Button>
          </div>
        )}
        <div className="space-y-1">
          {roster?.map((player) => {
            const results = atBatResults?.find((r) => r.playerId === player._id)?.results ?? [];
            return (
              <div
                key={player._id}
                className={`flex items-center justify-between rounded p-2 text-xs transition-colors cursor-pointer ${
                  selectedBatter === player._id ? "bg-accent" : "hover:bg-accent/50"
                }`}
                onClick={() => setSelectedBatter(player._id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground">#{player.number}</span>
                  <span>{player.name}</span>
                  <span className="text-muted-foreground">{player.position}</span>
                </div>
                <ResultPills results={results} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatBox } from "@/components/StatBox";
import { VeloChart } from "@/components/VeloChart";
import { ProgressBar } from "@/components/ProgressBar";
import { OutcomeButtons } from "@/components/OutcomeButtons";
import { ResultPills } from "@/components/ResultPills";
import {
  calcPct,
  calcBattersFaced,
  calcFPS,
  calcFPSLast5,
  calcVeloStats,
  evaluateAlerts,
  PITCHER_OUTCOMES,
  type AtBatResult,
  type Pitch,
} from "@/lib/baseball";
import { useState, useRef, useEffect } from "react";

interface PitchingTabProps {
  gameId: Id<"games">;
  teamId: Id<"teams">;
  game: { inning: number };
  onAlert: (msg: string, severity: string) => void;
  onCoachMessage: (msg: string) => void;
}

export function PitchingTab({ gameId, teamId, game, onAlert, onCoachMessage }: PitchingTabProps) {
  const pitchingStats = useQuery(api.pitching.getStats, { gameId, teamId });
  const staffAvailability = useQuery(api.pitching.getStaffAvailability, { teamId });
  const logPitch = useMutation(api.pitching.logPitch);
  const switchPitcher = useMutation(api.pitching.switchPitcher);

  const [veloInput, setVeloInput] = useState("");
  const [isNewBatter, setIsNewBatter] = useState(true);
  const prevStatsRef = useRef<{ pitchCount: number; fpsLast5: string; veloDropPct: string | null }>({
    pitchCount: 0,
    fpsLast5: "--",
    veloDropPct: null,
  });

  const activeAppearance = pitchingStats?.find((a) => !a.endInning);
  const pitches: Pitch[] = activeAppearance?.pitches.map((p) => ({
    s: p.isStrike,
    nb: p.newBatter,
    end: p.endOfAtBat,
  })) ?? [];
  const velocities = activeAppearance?.pitches
    .map((p) => p.velocity)
    .filter((v): v is number => v !== undefined) ?? [];

  const pitchCount = activeAppearance?.pitchCount ?? 0;
  const strikes = pitches.filter((p) => p.s).length;
  const strikePct = calcPct(strikes, pitches.length);
  const bf = calcBattersFaced(pitches);
  const fps = calcFPS(pitches);
  const fpsLast5 = calcFPSLast5(pitches);
  const veloStats = calcVeloStats(velocities);

  // Run alert engine after each pitch
  useEffect(() => {
    if (!activeAppearance) return;
    const prev = prevStatsRef.current;

    // Find pitcher profile from staff
    const pitcher = staffAvailability?.find((p) => p.playerId === activeAppearance.playerId);
    if (!pitcher?.pitching) return;

    const newAlerts = evaluateAlerts(
      {
        pitchCount,
        prevPitchCount: prev.pitchCount,
        fpsLast5,
        prevFpsLast5: prev.fpsLast5,
        veloDropPct: veloStats.dropPct,
        prevVeloDropPct: prev.veloDropPct,
      },
      { fatiguePoint: pitcher.pitching.fatiguePoint, name: activeAppearance.playerName }
    );

    for (const alert of newAlerts) {
      onAlert(alert.message, alert.severity);
      onCoachMessage(alert.message);
    }

    prevStatsRef.current = { pitchCount, fpsLast5, veloDropPct: veloStats.dropPct };
  }, [pitchCount, fpsLast5, veloStats.dropPct, activeAppearance, staffAvailability, onAlert, onCoachMessage]);

  async function handleLogPitch(isStrike: boolean) {
    if (!activeAppearance) return;
    const velo = veloInput ? parseFloat(veloInput) : undefined;
    await logPitch({
      gameId,
      teamId,
      appearanceId: activeAppearance.appearanceId,
      isStrike,
      velocity: velo,
      newBatter: isNewBatter,
      endOfAtBat: false,
    });
    setIsNewBatter(false);
    setVeloInput("");
  }

  async function handleEndAtBat(result: AtBatResult) {
    if (!activeAppearance) return;
    await logPitch({
      gameId,
      teamId,
      appearanceId: activeAppearance.appearanceId,
      isStrike: result === "K",
      newBatter: isNewBatter,
      endOfAtBat: true,
      atBatResult: result,
    });
    setIsNewBatter(true);
    setVeloInput("");
  }

  if (!activeAppearance) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">No active pitcher. Select one to start.</p>
        {staffAvailability?.map((p) => (
          <Button
            key={p.playerId}
            variant="outline"
            className="w-full justify-start"
            onClick={() => switchPitcher({ gameId, teamId, newPitcherId: p.playerId, inning: game.inning })}
          >
            #{p.number} {p.name}
          </Button>
        ))}
      </div>
    );
  }

  const atBatResults = activeAppearance.pitches
    .filter((p) => p.atBatResult)
    .map((p) => p.atBatResult!);

  return (
    <div className="space-y-4">
      {/* Pitcher Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-bold">{activeAppearance.playerName}</span>
          <span className="ml-2 text-xs text-muted-foreground">Inn {activeAppearance.startInning}+</span>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => switchPitcher({
            gameId,
            teamId,
            currentAppearanceId: activeAppearance.appearanceId,
            newPitcherId: activeAppearance.playerId,
            inning: game.inning,
            report: `${pitchCount}p, ${strikePct}% K, ${bf} BF`,
          })}
        >
          Pull Pitcher
        </Button>
      </div>

      {/* Pitch Count Progress */}
      <ProgressBar current={pitchCount} />

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Pitches" value={pitchCount} />
        <StatBox label="K%" value={`${strikePct}%`} />
        <StatBox label="BF" value={bf} />
        <StatBox label="FPS" value={`${fps}%`} />
      </div>

      {/* Velo Chart */}
      <VeloChart velocities={velocities} />

      {/* Pitch Input */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Velo"
          value={veloInput}
          onChange={(e) => setVeloInput(e.target.value)}
          className="w-20"
        />
        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleLogPitch(true)}>
          Strike
        </Button>
        <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleLogPitch(false)}>
          Ball
        </Button>
      </div>

      {/* At-Bat Outcomes */}
      <div>
        <div className="mb-1 text-xs font-medium text-muted-foreground">End At-Bat</div>
        <OutcomeButtons outcomes={PITCHER_OUTCOMES} onSelect={handleEndAtBat} />
      </div>

      {/* Results */}
      {atBatResults.length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">Results</div>
          <ResultPills results={atBatResults} />
        </div>
      )}
    </div>
  );
}

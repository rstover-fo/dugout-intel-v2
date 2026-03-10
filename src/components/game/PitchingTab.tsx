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
  const endCurrentPitcher = useMutation(api.pitching.endCurrentPitcher);

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

  // No active pitcher — show pitcher selection
  if (!activeAppearance) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{"// "}no active pitcher — select one to start</p>
        <div className="space-y-2">
          {staffAvailability?.map((p) => (
            <button
              key={p.playerId}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-dugout-surface-elevated px-4 py-3 text-left transition-colors hover:border-primary/40"
              onClick={() => switchPitcher({ gameId, teamId, newPitcherId: p.playerId, inning: game.inning })}
            >
              <span className="text-[11px] text-foreground">
                <span className="font-semibold text-primary">#{p.number}</span>{" "}{p.name.toLowerCase().replace(/\s+/g, "_")}
              </span>
              <span className="text-[10px] text-muted-foreground">select {">"}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const atBatResults = activeAppearance.pitches
    .filter((p) => p.atBatResult)
    .map((p) => p.atBatResult!);

  return (
    <div className="space-y-6">
      {/* Pitcher Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {activeAppearance.playerName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {activeAppearance.playerName.toLowerCase().replace(/\s+/g, "_")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              inn {activeAppearance.startInning}+ | {pitchCount} pitches
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="text-[11px]"
          onClick={() => endCurrentPitcher({
            gameId,
            teamId,
            appearanceId: activeAppearance.appearanceId,
            inning: game.inning,
            report: `${pitchCount}p, ${strikePct}% K, ${bf} BF`,
          })}
        >
          pull_pitcher
        </Button>
      </div>

      {/* Pitch Count Progress */}
      <ProgressBar current={pitchCount} />

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="pitches" value={pitchCount} />
        <StatBox label="strike_%" value={`${strikePct}%`} highlight={Number(strikePct) >= 60} />
        <StatBox label="batters" value={bf} />
        <StatBox label="fps" value={`${fps}%`} highlight={Number(fps) >= 65} />
      </div>

      {/* Velo Chart */}
      <VeloChart velocities={velocities} />

      {/* Pitch Input */}
      <div className="flex items-center gap-3">
        <Input
          type="number"
          placeholder="velo"
          value={veloInput}
          onChange={(e) => setVeloInput(e.target.value)}
          className="w-20 text-center"
        />
        <Button
          className="flex-1 bg-dugout-strike/15 text-dugout-strike border border-dugout-strike/30 hover:bg-dugout-strike/25"
          onClick={() => handleLogPitch(true)}
        >
          STRIKE
        </Button>
        <Button
          className="flex-1 bg-dugout-ball/15 text-dugout-ball border border-dugout-ball/30 hover:bg-dugout-ball/25"
          onClick={() => handleLogPitch(false)}
        >
          BALL
        </Button>
      </div>

      {/* At-Bat Outcomes */}
      <div>
        <p className="mb-2 text-[10px] text-muted-foreground">{"// "}end_at_bat</p>
        <OutcomeButtons outcomes={PITCHER_OUTCOMES} onSelect={handleEndAtBat} />
      </div>

      {/* Results */}
      {atBatResults.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] text-muted-foreground">{"// "}results</p>
          <ResultPills results={atBatResults} />
        </div>
      )}
    </div>
  );
}

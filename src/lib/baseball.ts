// --- Constants ---
const OUTS = new Set(["K", "GO", "FO"]);
const HITS = new Set(["1B", "2B", "3B", "HR"]);
const NON_AB = new Set(["BB", "HBP"]);

export const ALL_OUTCOMES = ["K", "GO", "FO", "1B", "2B", "3B", "HR", "BB", "HBP"] as const;
export type AtBatResult = (typeof ALL_OUTCOMES)[number];

export const PITCHER_OUTCOMES: [AtBatResult, string][] = [["K","#34d399"],["GO","#34d399"],["FO","#34d399"],["1B","#eab308"],["2B","#eab308"],["3B","#ea580c"],["BB","#ef4444"],["HBP","#ef4444"]];
export const BATTER_OUTCOMES: [AtBatResult, string][] = [["1B","#34d399"],["2B","#34d399"],["3B","#34d399"],["HR","#34d399"],["BB","#eab308"],["HBP","#eab308"],["K","#ef4444"],["GO","#ef4444"],["FO","#ef4444"]];

export const DAILY_PITCH_MAX = 75;
export const WEEKEND_PITCH_MAX = 100;

export const REST_TIERS = [
  { min: 1, max: 20, days: 0, label: "No rest" },
  { min: 21, max: 35, days: 1, label: "1 day" },
  { min: 36, max: 50, days: 2, label: "2 days" },
  { min: 51, max: 65, days: 3, label: "3 days" },
  { min: 66, max: 75, days: 4, label: "4 days" },
] as const;

// --- Classifiers ---
export function isOut(r: string): boolean { return OUTS.has(r); }
export function isHit(r: string): boolean { return HITS.has(r); }
export function isNonAB(r: string): boolean { return NON_AB.has(r); }

// --- Rest & Fatigue ---
export interface RestInfo { days: number; label: string; }

export function getRestInfo(pitchCount: number): RestInfo {
  if (pitchCount === 0) return { days: 0, label: "Available" };
  for (const tier of REST_TIERS) {
    if (pitchCount >= tier.min && pitchCount <= tier.max) return { days: tier.days, label: tier.label };
  }
  return { days: 4, label: "4+ days" };
}

export function getNextThreshold(pitchCount: number): { threshold: number; nextRestDays: number } | null {
  for (const tier of REST_TIERS) {
    if (pitchCount < tier.max) return { threshold: tier.max, nextRestDays: getRestInfo(tier.max + 1).days };
  }
  return null;
}

export function getWeekendAvailability(saturdayPitches: number) {
  const remaining = WEEKEND_PITCH_MAX - saturdayPitches;
  const restDay = getRestInfo(saturdayPitches);
  const canPitch = restDay.days === 0;
  const dailyMax = Math.min(remaining, DAILY_PITCH_MAX);
  return { remaining, canPitch, dailyMax, restDay };
}

// --- Math Helpers ---
export function calcPct(num: number, den: number): string {
  return den > 0 ? ((num / den) * 100).toFixed(0) : "--";
}

export function arrayAvg(arr: number[]): string {
  return arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "--";
}

export function arrayPeak(arr: number[]): string {
  return arr.length > 0 ? Math.max(...arr).toFixed(1) : "--";
}

// --- Pitch Analytics ---
export interface Pitch { s: boolean; nb: boolean; end: boolean; }

export function calcBattersFaced(pitches: Pitch[]): number {
  let count = 0;
  for (let i = 0; i < pitches.length; i++) {
    if (pitches[i].nb) count++;
  }
  return count;
}

export function calcFPS(pitches: Pitch[]): string {
  const batters: { fps: boolean }[] = [];
  let current: Pitch[] = [];
  pitches.forEach((p, i) => {
    if (p.nb && i > 0) { batters.push({ fps: current[0]?.s || false }); current = []; }
    current.push(p);
  });
  if (current.length > 0) batters.push({ fps: current[0]?.s || false });
  return calcPct(batters.filter(b => b.fps).length, batters.length);
}

export function calcFPSLast5(pitches: Pitch[]): string {
  const batters: { fps: boolean }[] = [];
  let current: Pitch[] = [];
  pitches.forEach((p, i) => {
    if (p.nb && i > 0) { batters.push({ fps: current[0]?.s || false }); current = []; }
    current.push(p);
  });
  if (current.length > 0) batters.push({ fps: current[0]?.s || false });
  const last5 = batters.slice(-5);
  return last5.length >= 3 ? calcPct(last5.filter(b => b.fps).length, last5.length) : "--";
}

export interface VeloStats { avg: string; peak: string; recentAvg: string; dropPct: string | null; }

export function calcVeloStats(velocities: number[]): VeloStats {
  const avg = arrayAvg(velocities);
  const peak = arrayPeak(velocities);
  const recent = velocities.slice(-5);
  const recentAvg = arrayAvg(recent);
  const dropPct = velocities.length >= 5 && +peak > 0
    ? ((1 - +recentAvg / +peak) * 100).toFixed(1)
    : null;
  return { avg, peak, recentAvg, dropPct };
}

// --- Alert Engine ---
export interface AlertInput {
  pitchCount: number;
  prevPitchCount: number;
  fpsLast5: string;
  prevFpsLast5: string;
  veloDropPct: string | null;
  prevVeloDropPct: string | null;
}

export interface PitcherProfile {
  fatiguePoint: number;
  name: string;
}

export interface Alert {
  message: string;
  severity: "danger" | "warning" | "info";
}

export function evaluateAlerts(input: AlertInput, profile: PitcherProfile): Alert[] {
  const alerts: Alert[] = [];
  const { pitchCount, prevPitchCount, fpsLast5, prevFpsLast5, veloDropPct, prevVeloDropPct } = input;
  const { fatiguePoint, name } = profile;

  if (pitchCount === fatiguePoint && prevPitchCount < fatiguePoint) {
    alerts.push({ message: `${name} at fatigue point (${fatiguePoint}p)`, severity: "warning" });
  }

  const nextTh = getNextThreshold(prevPitchCount);
  if (nextTh && pitchCount >= nextTh.threshold && prevPitchCount < nextTh.threshold) {
    alerts.push({ message: `${name} crossed ${nextTh.threshold}p -- now ${nextTh.nextRestDays} rest days`, severity: "danger" });
  }

  if (pitchCount >= 35 && prevPitchCount < 35) alerts.push({ message: `${name} at 35 -- 1d rest. +1 more=2d!`, severity: "danger" });
  if (pitchCount >= 50 && prevPitchCount < 50) alerts.push({ message: `${name} AT 50. 2d rest.`, severity: "danger" });
  if (pitchCount >= 65 && prevPitchCount < 65) alerts.push({ message: `${name} AT 65. 3d. +1=4d!`, severity: "danger" });
  if (pitchCount >= 75 && prevPitchCount < 75) alerts.push({ message: `${name} AT 75 PG MAX. PULL.`, severity: "danger" });

  if (fpsLast5 !== "--" && +fpsLast5 < 40 && fpsLast5 !== prevFpsLast5) {
    alerts.push({ message: `${name} FPS at ${fpsLast5}%`, severity: "warning" });
  }

  if (veloDropPct && +veloDropPct > 8 && veloDropPct !== prevVeloDropPct) {
    alerts.push({ message: `${name} velo down ${veloDropPct}%`, severity: "danger" });
  }

  return alerts;
}

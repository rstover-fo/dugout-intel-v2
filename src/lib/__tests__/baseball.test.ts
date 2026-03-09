import { describe, it, expect } from "vitest";
import {
  getRestInfo,
  getNextThreshold,
  calcPct,
  arrayAvg,
  arrayPeak,
  isOut,
  isHit,
  evaluateAlerts,
  calcBattersFaced,
  calcFPS,
  calcVeloStats,
} from "../baseball";

describe("getRestInfo", () => {
  it("returns Available for 0 pitches", () => {
    expect(getRestInfo(0)).toEqual({ days: 0, label: "Available" });
  });
  it("returns no rest for 1-20 pitches", () => {
    expect(getRestInfo(15).days).toBe(0);
  });
  it("returns 1 day for 21-35", () => {
    expect(getRestInfo(30).days).toBe(1);
  });
  it("returns 4 days for 66-75", () => {
    expect(getRestInfo(70).days).toBe(4);
  });
  it("returns 4+ for over 75", () => {
    expect(getRestInfo(80).days).toBe(4);
  });
});

describe("getNextThreshold", () => {
  it("returns 20 threshold when at 10 pitches", () => {
    const result = getNextThreshold(10);
    expect(result?.threshold).toBe(20);
  });
  it("returns null when at max", () => {
    expect(getNextThreshold(75)).toBeNull();
  });
});

describe("calcPct", () => {
  it("calculates percentage", () => {
    expect(calcPct(3, 10)).toBe("30");
  });
  it("returns -- for zero denominator", () => {
    expect(calcPct(0, 0)).toBe("--");
  });
});

describe("arrayAvg / arrayPeak", () => {
  it("calculates average", () => {
    expect(arrayAvg([50, 60, 70])).toBe("60.0");
  });
  it("calculates peak", () => {
    expect(arrayPeak([50, 70, 60])).toBe("70.0");
  });
  it("returns -- for empty arrays", () => {
    expect(arrayAvg([])).toBe("--");
    expect(arrayPeak([])).toBe("--");
  });
});

describe("isOut / isHit", () => {
  it("identifies outs", () => {
    expect(isOut("K")).toBe(true);
    expect(isOut("GO")).toBe(true);
    expect(isOut("FO")).toBe(true);
    expect(isOut("1B")).toBe(false);
  });
  it("identifies hits", () => {
    expect(isHit("1B")).toBe(true);
    expect(isHit("HR")).toBe(true);
    expect(isHit("K")).toBe(false);
    expect(isHit("BB")).toBe(false);
  });
});

describe("calcBattersFaced", () => {
  it("counts batters from pitch log", () => {
    const pitches = [
      { s: true, nb: true, end: false },
      { s: false, nb: false, end: true },
      { s: true, nb: true, end: false },
      { s: true, nb: false, end: true },
    ];
    expect(calcBattersFaced(pitches)).toBe(2);
  });
});

describe("calcFPS", () => {
  it("calculates first pitch strike percentage", () => {
    const pitches = [
      { s: true, nb: true, end: true },
      { s: false, nb: true, end: false },
      { s: true, nb: false, end: true },
      { s: true, nb: true, end: true },
    ];
    expect(calcFPS(pitches)).toBe("67");
  });
});

describe("calcVeloStats", () => {
  it("computes avg, peak, drop", () => {
    const velos = [60, 62, 61, 58, 55];
    const stats = calcVeloStats(velos);
    expect(stats.avg).toBe("59.2");
    expect(stats.peak).toBe("62.0");
    expect(+stats.dropPct!).toBeGreaterThan(0);
  });
});

describe("evaluateAlerts", () => {
  it("fires fatigue alert at pitcher fatigue point", () => {
    const alerts = evaluateAlerts(
      { pitchCount: 28, prevPitchCount: 27, fpsLast5: "60", prevFpsLast5: "60", veloDropPct: null, prevVeloDropPct: null },
      { fatiguePoint: 28, name: "Grawunder #2" }
    );
    expect(alerts.some(a => a.severity === "warning" && a.message.includes("fatigue"))).toBe(true);
  });
  it("fires danger alert at 35 pitches", () => {
    const alerts = evaluateAlerts(
      { pitchCount: 35, prevPitchCount: 34, fpsLast5: "60", prevFpsLast5: "60", veloDropPct: null, prevVeloDropPct: null },
      { fatiguePoint: 35, name: "Sidor #1" }
    );
    expect(alerts.some(a => a.severity === "danger" && a.message.includes("35"))).toBe(true);
  });
  it("fires FPS warning when below 40%", () => {
    const alerts = evaluateAlerts(
      { pitchCount: 30, prevPitchCount: 30, fpsLast5: "33", prevFpsLast5: "50", veloDropPct: null, prevVeloDropPct: null },
      { fatiguePoint: 35, name: "Sidor #1" }
    );
    expect(alerts.some(a => a.severity === "warning" && a.message.includes("FPS"))).toBe(true);
  });
  it("fires velo drop danger when >8%", () => {
    const alerts = evaluateAlerts(
      { pitchCount: 30, prevPitchCount: 30, fpsLast5: "60", prevFpsLast5: "60", veloDropPct: "9.5", prevVeloDropPct: null },
      { fatiguePoint: 35, name: "Sidor #1" }
    );
    expect(alerts.some(a => a.severity === "danger" && a.message.includes("velo"))).toBe(true);
  });
});

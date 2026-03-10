"use client";

import { isOut, isHit } from "@/lib/baseball";

interface ResultPillsProps {
  results: string[];
}

export function ResultPills({ results }: ResultPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {results.map((r, i) => {
        const style = isOut(r)
          ? "bg-dugout-strike/15 text-dugout-strike"
          : isHit(r)
            ? "bg-fatigue-med/15 text-fatigue-med"
            : "bg-dugout-ball/15 text-dugout-ball";
        return (
          <span key={i} className={`rounded px-2.5 py-1 text-[10px] font-semibold ${style}`}>
            {r}
          </span>
        );
      })}
    </div>
  );
}

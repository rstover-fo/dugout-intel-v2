"use client";

import { isOut, isHit } from "@/lib/baseball";

interface ResultPillsProps {
  results: string[];
}

export function ResultPills({ results }: ResultPillsProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {results.map((r, i) => {
        const bg = isOut(r)
          ? "bg-emerald-500/20 text-emerald-400"
          : isHit(r)
            ? "bg-yellow-500/20 text-yellow-400"
            : "bg-red-500/20 text-red-400";
        return (
          <span key={i} className={`rounded px-1.5 py-0.5 text-xs font-medium ${bg}`}>
            {r}
          </span>
        );
      })}
    </div>
  );
}

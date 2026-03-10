"use client";

import { type AtBatResult, isOut, isHit } from "@/lib/baseball";

interface OutcomeButtonsProps {
  outcomes: [AtBatResult, string][];
  onSelect: (result: AtBatResult) => void;
  disabled?: boolean;
}

export function OutcomeButtons({ outcomes, onSelect, disabled }: OutcomeButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {outcomes.map(([result]) => {
        const style = isOut(result)
          ? "text-dugout-strike font-semibold"
          : isHit(result)
            ? "text-fatigue-med"
            : "text-dugout-ball";
        return (
          <button
            key={result}
            disabled={disabled}
            onClick={() => onSelect(result)}
            className={`rounded-md bg-dugout-surface-elevated px-3.5 py-2 text-[11px] transition-colors hover:bg-secondary disabled:opacity-50 ${style}`}
          >
            {result}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { type AtBatResult } from "@/lib/baseball";
import { Button } from "@/components/ui/button";

interface OutcomeButtonsProps {
  outcomes: [AtBatResult, string][];
  onSelect: (result: AtBatResult) => void;
  disabled?: boolean;
}

export function OutcomeButtons({ outcomes, onSelect, disabled }: OutcomeButtonsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {outcomes.map(([result, color]) => (
        <Button
          key={result}
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(result)}
          className="min-w-[44px] border-2 font-bold"
          style={{ borderColor: color, color }}
        >
          {result}
        </Button>
      ))}
    </div>
  );
}

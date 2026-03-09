"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeekendAvailability } from "@/lib/baseball";
import { useState } from "react";

interface IntelTabProps {
  teamId: Id<"teams">;
}

export function IntelTab({ teamId }: IntelTabProps) {
  const today = new Date();
  const weekendDate = today.toISOString().split("T")[0];
  const budget = useQuery(api.budgets.getBudgetForWeekend, { teamId, weekendDate });
  const addBudget = useMutation(api.budgets.addBudgetEntry);

  const [playerName, setPlayerName] = useState("");
  const [satPitches, setSatPitches] = useState("");

  async function handleAdd() {
    if (!playerName.trim() || !satPitches) return;
    await addBudget({
      teamId,
      weekendDate,
      playerName: playerName.trim(),
      saturdayPitches: parseInt(satPitches, 10),
    });
    setPlayerName("");
    setSatPitches("");
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Weekend Pitch Budget ({weekendDate})</div>

      {budget?.map((entry) => {
        const avail = getWeekendAvailability(entry.saturdayPitches);
        return (
          <Card key={entry._id}>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-sm font-medium">{entry.playerName}</div>
                <div className="text-xs text-muted-foreground">
                  Sat: {entry.saturdayPitches}p
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${avail.canPitch ? "text-emerald-400" : "text-red-400"}`}>
                  {avail.canPitch ? `${avail.dailyMax}p avail` : "Resting"}
                </div>
                <div className="text-xs text-muted-foreground">{avail.remaining}p wknd left</div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Add Saturday Count</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0">
          <Input
            placeholder="Player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Sat pitches"
              value={satPitches}
              onChange={(e) => setSatPitches(e.target.value)}
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={handleAdd} disabled={!playerName.trim() || !satPitches}>
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

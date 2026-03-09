"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { PlayerCard } from "@/components/PlayerCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ScoutingTabProps {
  gameId: Id<"games">;
  teamId: Id<"teams">;
  game: { opponent: string };
}

export function ScoutingTab({ gameId, teamId, game }: ScoutingTabProps) {
  const opponentTeams = useQuery(api.players.listOpponentTeams, { teamId });
  const [selectedTeam, setSelectedTeam] = useState(game.opponent);
  const scoutedPlayers = useQuery(
    api.players.getScoutedTeam,
    selectedTeam ? { teamId, opponentTeamName: selectedTeam } : "skip"
  );
  const atBatResults = useQuery(api.lineup.getAtBatResults, { gameId, teamId });
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Select value={selectedTeam} onValueChange={setSelectedTeam}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select opponent" />
        </SelectTrigger>
        <SelectContent>
          {opponentTeams?.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {scoutedPlayers?.map((player) => {
        const results = atBatResults?.find((r) => r.playerId === player._id)?.results;
        return (
          <PlayerCard
            key={player._id}
            name={player.name}
            number={player.number}
            position={player.position}
            threat={player.threat}
            notes={player.notes}
            defenseNotes={player.defenseNotes}
            results={results}
            expanded={expandedPlayer === player._id}
            onToggle={() => setExpandedPlayer(expandedPlayer === player._id ? null : player._id)}
          />
        );
      })}

      {scoutedPlayers?.length === 0 && (
        <p className="text-sm text-muted-foreground">No scouting data for this opponent.</p>
      )}
    </div>
  );
}

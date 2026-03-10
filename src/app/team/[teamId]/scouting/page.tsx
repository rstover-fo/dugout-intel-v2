"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCard } from "@/components/PlayerCard";
import { useState } from "react";
import Link from "next/link";

const TEAM_COLORS: Record<string, string> = {
  thunder: "bg-fatigue-med",
  stingrays: "bg-primary",
  hawks: "bg-destructive",
  sharks: "bg-blue-500",
  wolves: "bg-purple-500",
};

function getTeamColor(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(TEAM_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "bg-muted-foreground";
}

export default function ScoutingPage() {
  const params = useParams();
  const teamId = params.teamId as Id<"teams">;
  const opponentTeams = useQuery(api.players.listOpponentTeams, { teamId });
  const [selectedTeam, setSelectedTeam] = useState("");
  const scoutedPlayers = useQuery(
    api.players.getScoutedTeam,
    selectedTeam ? { teamId, opponentTeamName: selectedTeam } : "skip"
  );
  const addPlayer = useMutation(api.players.addPlayer);
  const removePlayer = useMutation(api.players.removePlayer);

  const [showForm, setShowForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");
  const [threat, setThreat] = useState("medium");
  const [notes, setNotes] = useState("");
  const [defenseNotes, setDefenseNotes] = useState("");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);

  async function handleAdd() {
    if (!name.trim() || !number.trim()) return;
    const teamName = newTeamName.trim() || selectedTeam;
    if (!teamName) return;
    await addPlayer({
      teamId,
      name: name.trim(),
      number: number.trim(),
      position: position.trim() || "UTIL",
      isOurPlayer: false,
      opponentTeamName: teamName,
      threat,
      notes: notes.trim() || undefined,
      defenseNotes: defenseNotes.trim() || undefined,
    });
    setName("");
    setNumber("");
    setPosition("");
    setNotes("");
    setDefenseNotes("");
    setShowForm(false);
    if (newTeamName.trim()) {
      setSelectedTeam(newTeamName.trim());
      setNewTeamName("");
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border bg-dugout-surface px-6 py-3">
        <Link href={`/team/${teamId}`} className="text-xs text-primary hover:text-primary/80 transition-colors">
          {"<< "}team_home
        </Link>
        <span className="text-xs text-muted-foreground">{"> "}opponent_intel</span>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">{"> "}scouting</h1>
            <p className="text-xs text-muted-foreground">
              {opponentTeams?.length ?? 0} teams scouted
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "cancel" : "+ add_player"}
          </Button>
        </div>

        {/* Add Player Form */}
        {showForm && (
          <div className="rounded-lg border border-border bg-dugout-surface-elevated p-4 space-y-3">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {"// "}scout new player
            </div>
            {!selectedTeam && (
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="team name"
                className="h-8 bg-secondary text-xs border-border"
              />
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="name"
                className="h-8 bg-secondary text-xs border-border"
              />
              <Input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="#"
                className="h-8 bg-secondary text-xs border-border"
              />
              <Input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="pos (UTIL)"
                className="h-8 bg-secondary text-xs border-border"
              />
            </div>
            <div>
              <div className="mb-1.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                {"// "}threat level
              </div>
              <div className="flex gap-1.5">
                {["elite", "high", "medium", "low"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setThreat(t)}
                    className={`rounded px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                      threat === t
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="approach notes..."
              className="h-8 bg-secondary text-xs border-border"
            />
            <Input
              value={defenseNotes}
              onChange={(e) => setDefenseNotes(e.target.value)}
              placeholder="defense notes..."
              className="h-8 bg-secondary text-xs border-border"
            />
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!name.trim() || !number.trim() || (!selectedTeam && !newTeamName.trim())}
            >
              $ save
            </Button>
          </div>
        )}

        {/* Team Selector */}
        {opponentTeams && opponentTeams.length > 0 && (
          <div className="space-y-2">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
              {"// "}select team
            </div>
            <div className="flex flex-wrap gap-2">
              {opponentTeams.map((teamName) => (
                <button
                  key={teamName}
                  onClick={() => setSelectedTeam(selectedTeam === teamName ? "" : teamName)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[11px] transition-colors ${
                    selectedTeam === teamName
                      ? "border-primary/30 bg-dugout-surface-elevated text-foreground"
                      : "border-border bg-dugout-surface text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${getTeamColor(teamName)}`} />
                  {teamName.toLowerCase().replace(/\s+/g, "_")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Teams State */}
        {opponentTeams && opponentTeams.length === 0 && !showForm && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-dugout-surface-elevated px-6 py-12">
            <span className="text-2xl text-muted-foreground">{"{}"}</span>
            <p className="text-xs text-muted-foreground">{"// "}no opponent data</p>
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              + scout_first_team
            </Button>
          </div>
        )}

        {/* Scouted Players */}
        {selectedTeam && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${getTeamColor(selectedTeam)}`} />
                <h2 className="text-sm font-bold text-foreground">
                  {selectedTeam.toLowerCase().replace(/\s+/g, "_")}
                </h2>
                <span className="text-[10px] text-muted-foreground">
                  {scoutedPlayers?.length ?? 0} players
                </span>
              </div>
            </div>

            {/* Player Cards */}
            <div className="space-y-2">
              {scoutedPlayers?.map((player) => (
                <div key={player._id} className="relative">
                  <PlayerCard
                    name={player.name}
                    number={player.number}
                    position={player.position}
                    threat={player.threat}
                    notes={player.notes}
                    defenseNotes={player.defenseNotes}
                    expanded={expandedPlayer === player._id}
                    onToggle={() =>
                      setExpandedPlayer(expandedPlayer === player._id ? null : player._id)
                    }
                  />
                  {expandedPlayer === player._id && (
                    <div className="mt-1 flex justify-end px-2">
                      <button
                        className="text-[10px] text-destructive/70 hover:text-destructive transition-colors"
                        onClick={() => removePlayer({ playerId: player._id, teamId })}
                      >
                        {"[x] "}remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {scoutedPlayers?.length === 0 && (
              <div className="rounded-lg border border-border bg-dugout-surface px-4 py-6 text-center">
                <p className="text-xs text-muted-foreground">{"// "}no players scouted for this team</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

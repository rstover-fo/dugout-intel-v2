"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerCard } from "@/components/PlayerCard";
import { useState } from "react";
import Link from "next/link";

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
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Scouting</h1>
        <Link href={`/team/${teamId}`}>
          <Button variant="ghost" size="sm">Back</Button>
        </Link>
      </div>

      <Select value={selectedTeam} onValueChange={setSelectedTeam}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder="Select opponent team" />
        </SelectTrigger>
        <SelectContent>
          {opponentTeams?.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

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
            onToggle={() => setExpandedPlayer(expandedPlayer === player._id ? null : player._id)}
          />
          {expandedPlayer === player._id && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 text-xs text-red-400"
              onClick={() => removePlayer({ playerId: player._id, teamId })}
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      {showForm ? (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Add Scouted Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            {!selectedTeam && (
              <div>
                <Label className="text-xs">New Team Name</Label>
                <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className="h-8 text-xs" />
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="w-20">
                <Label className="text-xs">#</Label>
                <Input value={number} onChange={(e) => setNumber(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Position</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Threat</Label>
                <Select value={threat} onValueChange={setThreat}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="elite">Elite</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Approach Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Defense Notes</Label>
              <Input value={defenseNotes} onChange={(e) => setDefenseNotes(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Add</Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button className="w-full" onClick={() => setShowForm(true)}>+ Add Player</Button>
      )}
    </div>
  );
}

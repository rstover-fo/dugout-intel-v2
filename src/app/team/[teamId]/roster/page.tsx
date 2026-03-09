"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";

export default function RosterPage() {
  const params = useParams();
  const teamId = params.teamId as Id<"teams">;
  const roster = useQuery(api.players.getRoster, { teamId });
  const addPlayer = useMutation(api.players.addPlayer);
  const removePlayer = useMutation(api.players.removePlayer);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");

  async function handleAdd() {
    if (!name.trim() || !number.trim()) return;
    await addPlayer({
      teamId,
      name: name.trim(),
      number: number.trim(),
      position: position.trim() || "UTIL",
      isOurPlayer: true,
    });
    setName("");
    setNumber("");
    setPosition("");
    setShowForm(false);
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Roster Management</h1>
        <Link href={`/team/${teamId}`}>
          <Button variant="ghost" size="sm">Back</Button>
        </Link>
      </div>

      <div className="space-y-2">
        {roster?.map((player) => (
          <Card key={player._id}>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <span className="text-sm font-bold">#{player.number}</span>
                <span className="ml-2 text-sm">{player.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{player.position}</span>
              </div>
              <div className="flex items-center gap-2">
                {player.seasonStats && (
                  <span className="text-xs text-muted-foreground">
                    .{(player.seasonStats.avg * 1000).toFixed(0).padStart(3, "0")} AVG
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-red-400"
                  onClick={() => removePlayer({ playerId: player._id, teamId })}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm ? (
        <Card>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Add Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Number</Label>
                <Input value={number} onChange={(e) => setNumber(e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Position</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="UTIL" className="h-8 text-xs" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !number.trim()}>Add</Button>
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

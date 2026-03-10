"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";

const POSITIONS = ["ALL", "P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "UTIL"];

export default function RosterPage() {
  const params = useParams();
  const teamId = params.teamId as Id<"teams">;
  const roster = useQuery(api.players.getRoster, { teamId });
  const addPlayer = useMutation(api.players.addPlayer);
  const removePlayer = useMutation(api.players.removePlayer);

  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState("");

  const filtered = roster?.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.number.includes(search);
    const matchesPos = posFilter === "ALL" || p.position === posFilter;
    return matchesSearch && matchesPos;
  });

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
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border bg-dugout-surface px-6 py-3">
        <Link href={`/team/${teamId}`} className="text-xs text-primary hover:text-primary/80 transition-colors">
          {"<< "}team_home
        </Link>
        <span className="text-xs text-muted-foreground">{"> "}roster_management</span>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">{"> "}roster</h1>
            <p className="text-xs text-muted-foreground">
              {filtered?.length ?? 0} players {posFilter !== "ALL" && `· ${posFilter}`}
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
              {"// "}new player
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !number.trim()}>
              $ save
            </Button>
          </div>
        )}

        {/* Search + Position Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search players..."
            className="h-8 max-w-xs bg-dugout-surface text-xs border-border"
          />
          <div className="flex flex-wrap gap-1.5">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className={`rounded px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  posFilter === pos
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Roster Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-dugout-surface-elevated">
          {/* Table Header */}
          <div className="grid grid-cols-[3rem_1fr_3rem_3.5rem_4rem] gap-2 bg-secondary px-4 py-2.5 text-[9px] uppercase tracking-widest text-muted-foreground">
            <span>#</span>
            <span>name</span>
            <span>pos</span>
            <span>avg</span>
            <span className="text-right">actions</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border">
            {filtered?.map((player) => (
              <div
                key={player._id}
                className="grid grid-cols-[3rem_1fr_3rem_3.5rem_4rem] gap-2 px-4 py-2.5 transition-colors hover:bg-secondary/50"
              >
                <span className="text-[11px] font-bold text-primary">{player.number}</span>
                <span className="text-[11px] text-foreground">
                  {player.name.toLowerCase().replace(/\s+/g, "_")}
                </span>
                <span className="text-[10px] text-muted-foreground">{player.position}</span>
                <span className="text-[11px] font-semibold text-foreground">
                  {player.seasonStats
                    ? `.${(player.seasonStats.avg * 1000).toFixed(0).padStart(3, "0")}`
                    : "---"}
                </span>
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="text-[10px] text-destructive/70 hover:text-destructive transition-colors"
                    onClick={() => removePlayer({ playerId: player._id, teamId })}
                  >
                    [x]
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filtered?.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground">
                {"// "}no players {posFilter !== "ALL" ? `at ${posFilter}` : "found"}
              </p>
            </div>
          )}

          {/* Footer */}
          {(filtered?.length ?? 0) > 0 && (
            <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-2">
              <span className="text-[10px] text-muted-foreground">
                {filtered?.length} of {roster?.length} players
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

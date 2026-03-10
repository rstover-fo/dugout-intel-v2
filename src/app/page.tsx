"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { isAuthenticated } = useConvexAuth();
  const teams = useQuery(api.teams.listMyTeams, isAuthenticated ? {} : "skip");
  const createTeam = useMutation(api.teams.create);
  const seedTeam = useMutation(api.seed.seedTeam);
  const [showForm, setShowForm] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [season, setSeason] = useState("Spring 2026");

  async function handleCreate() {
    if (!teamName.trim()) return;
    await createTeam({ name: teamName.trim(), season });
    setTeamName("");
    setShowForm(false);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border bg-dugout-surface px-6 py-3">
        <span className="text-sm font-semibold text-foreground">{"> "}dugout_intel</span>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <SignedIn>
          {/* Section Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{"> "}your_teams</h1>
            {!showForm && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                + new_team
              </Button>
            )}
          </div>

          {/* Loading */}
          {teams === undefined && (
            <p className="text-xs text-muted-foreground">loading...</p>
          )}

          {/* Empty State */}
          {teams?.length === 0 && !showForm && (
            <div className="rounded-lg border border-border bg-dugout-surface-elevated p-8 text-center">
              <p className="mb-1 text-sm text-muted-foreground">{"// "}no teams yet</p>
              <p className="mb-4 text-xs text-muted-foreground">create one to get started</p>
              <div className="flex justify-center gap-3">
                <Button size="sm" onClick={() => setShowForm(true)}>
                  + new_team
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={seeding}
                  onClick={async () => {
                    setSeeding(true);
                    await seedTeam({ teamName: "Armadillos 9U", season: "Spring 2026" });
                    setSeeding(false);
                  }}
                >
                  {seeding ? "seeding..." : "seed_demo"}
                </Button>
              </div>
            </div>
          )}

          {/* Team Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {teams?.map((team) =>
              team ? (
                <Link key={team._id} href={`/team/${team._id}`}>
                  <div className="group flex items-center gap-4 rounded-lg border border-border bg-dugout-surface-elevated p-4 transition-colors hover:border-primary/40 hover:bg-dugout-surface-elevated/80">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {team.name.toLowerCase().replace(/\s+/g, "_")}
                      </p>
                      <p className="text-xs text-muted-foreground">{team.season}</p>
                    </div>
                    <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      {">>"}
                    </span>
                  </div>
                </Link>
              ) : null
            )}
          </div>

          {/* Create Team Form */}
          {showForm && (
            <div className="mt-6 rounded-lg border border-border bg-dugout-surface-elevated p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{"> "}create_team</p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName" className="text-xs text-muted-foreground">team_name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="armadillos_9u"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="season" className="text-xs text-muted-foreground">season</Label>
                  <Input
                    id="season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreate} disabled={!teamName.trim()} size="sm">
                    $ create
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                    cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SignedIn>
      </div>
    </main>
  );
}

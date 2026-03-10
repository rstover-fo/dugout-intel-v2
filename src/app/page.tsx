"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@convex/_generated/api";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <main className="mx-auto max-w-lg p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dugout Intel</h1>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>

      <SignedIn>
        <div className="space-y-3">
          {teams === undefined && <p className="text-sm text-muted-foreground">Loading teams...</p>}
          {teams?.length === 0 && (
            <p className="text-sm text-muted-foreground">No teams yet. Create one to get started.</p>
          )}
          {teams?.map((team) =>
            team ? (
              <Link key={team._id} href={`/team/${team._id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{team.season}</p>
                  </CardHeader>
                </Card>
              </Link>
            ) : null
          )}
        </div>

        {showForm ? (
          <Card className="mt-4">
            <CardContent className="space-y-3 p-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Armadillos 9U"
                />
              </div>
              <div>
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={!teamName.trim()}>Create Team</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Button className="mt-4 w-full" onClick={() => setShowForm(true)}>
              + New Team
            </Button>
            {teams?.length === 0 && (
              <Button
                className="mt-2 w-full"
                variant="outline"
                disabled={seeding}
                onClick={async () => {
                  setSeeding(true);
                  await seedTeam({ teamName: "Armadillos 9U", season: "Spring 2026" });
                  setSeeding(false);
                }}
              >
                {seeding ? "Seeding..." : "Seed Demo Team (Armadillos)"}
              </Button>
            )}
          </>
        )}
      </SignedIn>
    </main>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { GameShell } from "@/components/game/GameShell";

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as Id<"games">;
  const teamId = params.teamId as Id<"teams">;

  return <GameShell gameId={gameId} teamId={teamId} />;
}

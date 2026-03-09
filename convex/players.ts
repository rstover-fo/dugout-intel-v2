import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertTeamAccess, assertWriteAccess, assertDocBelongsToTeam } from "./helpers";

export const getRoster = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    const players = await ctx.db
      .query("players")
      .withIndex("by_team_and_type", (q) => q.eq("teamId", args.teamId).eq("isOurPlayer", true))
      .collect();
    const result = [];
    for (const player of players) {
      const stats = await ctx.db
        .query("playerSeasonStats")
        .withIndex("by_player", (q) => q.eq("playerId", player._id))
        .first();
      result.push({ ...player, seasonStats: stats });
    }
    return result;
  },
});

export const getScoutedTeam = query({
  args: { teamId: v.id("teams"), opponentTeamName: v.string() },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db
      .query("players")
      .withIndex("by_opponent", (q) =>
        q.eq("teamId", args.teamId).eq("opponentTeamName", args.opponentTeamName)
      )
      .collect();
  },
});

export const listOpponentTeams = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    const opponents = await ctx.db
      .query("players")
      .withIndex("by_team_and_type", (q) => q.eq("teamId", args.teamId).eq("isOurPlayer", false))
      .collect();
    const teamNames = new Set(opponents.map((p) => p.opponentTeamName).filter(Boolean));
    return Array.from(teamNames) as string[];
  },
});

export const addPlayer = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    number: v.string(),
    position: v.string(),
    isOurPlayer: v.boolean(),
    opponentTeamName: v.optional(v.string()),
    threat: v.optional(v.string()),
    notes: v.optional(v.string()),
    defenseNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    return await ctx.db.insert("players", {
      teamId: args.teamId,
      name: args.name,
      number: args.number,
      position: args.position,
      isOurPlayer: args.isOurPlayer,
      opponentTeamName: args.opponentTeamName,
      threat: args.threat,
      notes: args.notes,
      defenseNotes: args.defenseNotes,
    });
  },
});

export const updatePlayer = mutation({
  args: {
    playerId: v.id("players"),
    teamId: v.id("teams"),
    name: v.optional(v.string()),
    number: v.optional(v.string()),
    position: v.optional(v.string()),
    threat: v.optional(v.string()),
    notes: v.optional(v.string()),
    defenseNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    await assertDocBelongsToTeam(ctx, args.playerId, args.teamId);
    const { playerId, teamId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(playerId, filtered);
  },
});

export const removePlayer = mutation({
  args: { playerId: v.id("players"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    await assertDocBelongsToTeam(ctx, args.playerId, args.teamId);
    await ctx.db.delete(args.playerId);
  },
});

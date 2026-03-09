import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertTeamAccess } from "./helpers";

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    opponent: v.string(),
  },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db.insert("games", {
      teamId: args.teamId,
      opponent: args.opponent,
      date: Date.now(),
      status: "pregame",
      ourScore: 0,
      theirScore: 0,
      inning: 1,
    });
  },
});

export const start = mutation({
  args: { gameId: v.id("games"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    await ctx.db.patch(args.gameId, { status: "live" });
  },
});

export const complete = mutation({
  args: { gameId: v.id("games"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    await ctx.db.patch(args.gameId, { status: "completed" });
  },
});

export const updateScore = mutation({
  args: {
    gameId: v.id("games"),
    teamId: v.id("teams"),
    side: v.union(v.literal("us"), v.literal("them")),
    delta: v.number(),
  },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (args.side === "us") {
      await ctx.db.patch(args.gameId, { ourScore: Math.max(0, game.ourScore + args.delta) });
    } else {
      await ctx.db.patch(args.gameId, { theirScore: Math.max(0, game.theirScore + args.delta) });
    }
  },
});

export const updateInning = mutation({
  args: { gameId: v.id("games"), teamId: v.id("teams"), inning: v.number() },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    await ctx.db.patch(args.gameId, { inning: args.inning });
  },
});

export const getLive = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db
      .query("games")
      .withIndex("by_team_and_status", (q) => q.eq("teamId", args.teamId).eq("status", "live"))
      .first();
  },
});

export const getHistory = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db
      .query("games")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .collect();
  },
});

export const getGame = query({
  args: { gameId: v.id("games"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db.get(args.gameId);
  },
});

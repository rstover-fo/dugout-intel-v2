import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertTeamAccess, assertWriteAccess } from "./helpers";

export const logAtBat = mutation({
  args: {
    gameId: v.id("games"),
    teamId: v.id("teams"),
    playerId: v.id("players"),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    const existing = await ctx.db
      .query("atBatResults")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    const playerRecord = existing.find((r) => r.playerId === args.playerId);
    if (playerRecord) {
      await ctx.db.patch(playerRecord._id, {
        results: [...playerRecord.results, args.result],
      });
    } else {
      await ctx.db.insert("atBatResults", {
        gameId: args.gameId,
        playerId: args.playerId,
        results: [args.result],
      });
    }
  },
});

export const getAtBatResults = query({
  args: { gameId: v.id("games"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db
      .query("atBatResults")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});

export const logOpponentPitch = mutation({
  args: {
    gameId: v.id("games"),
    teamId: v.id("teams"),
    pitcherName: v.string(),
    isStrike: v.boolean(),
    velocity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    const existing = await ctx.db
      .query("opponentPitcherLogs")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    const pitcherLog = existing.find((p) => p.pitcherName === args.pitcherName);
    if (pitcherLog) {
      await ctx.db.patch(pitcherLog._id, {
        strikes: pitcherLog.strikes + (args.isStrike ? 1 : 0),
        balls: pitcherLog.balls + (args.isStrike ? 0 : 1),
        velocities: args.velocity
          ? [...pitcherLog.velocities, args.velocity]
          : pitcherLog.velocities,
      });
    } else {
      await ctx.db.insert("opponentPitcherLogs", {
        gameId: args.gameId,
        pitcherName: args.pitcherName,
        strikes: args.isStrike ? 1 : 0,
        balls: args.isStrike ? 0 : 1,
        velocities: args.velocity ? [args.velocity] : [],
      });
    }
  },
});

export const getOpponentPitcher = query({
  args: { gameId: v.id("games"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db
      .query("opponentPitcherLogs")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});

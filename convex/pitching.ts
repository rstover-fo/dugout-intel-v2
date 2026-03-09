import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertTeamAccess, assertWriteAccess, assertDocBelongsToTeam } from "./helpers";

export const logPitch = mutation({
  args: {
    gameId: v.id("games"),
    teamId: v.id("teams"),
    appearanceId: v.id("pitcherAppearances"),
    isStrike: v.boolean(),
    velocity: v.optional(v.number()),
    newBatter: v.boolean(),
    endOfAtBat: v.boolean(),
    atBatResult: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    await assertDocBelongsToTeam(ctx, args.gameId, args.teamId);
    await ctx.db.insert("pitchLogs", {
      appearanceId: args.appearanceId,
      gameId: args.gameId,
      isStrike: args.isStrike,
      velocity: args.velocity,
      newBatter: args.newBatter,
      endOfAtBat: args.endOfAtBat,
      atBatResult: args.atBatResult,
      timestamp: Date.now(),
    });
    const appearance = await ctx.db.get(args.appearanceId);
    if (appearance) {
      await ctx.db.patch(args.appearanceId, {
        pitchCount: appearance.pitchCount + 1,
      });
    }
  },
});

export const switchPitcher = mutation({
  args: {
    gameId: v.id("games"),
    teamId: v.id("teams"),
    currentAppearanceId: v.optional(v.id("pitcherAppearances")),
    newPitcherId: v.id("players"),
    inning: v.number(),
    report: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    await assertDocBelongsToTeam(ctx, args.gameId, args.teamId);
    if (args.currentAppearanceId) {
      await ctx.db.patch(args.currentAppearanceId, {
        endInning: args.inning,
        report: args.report,
      });
    }
    const newAppearance = await ctx.db.insert("pitcherAppearances", {
      gameId: args.gameId,
      playerId: args.newPitcherId,
      startInning: args.inning,
      pitchCount: 0,
    });
    return newAppearance;
  },
});

export const endCurrentPitcher = mutation({
  args: {
    gameId: v.id("games"),
    teamId: v.id("teams"),
    appearanceId: v.id("pitcherAppearances"),
    inning: v.number(),
    report: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    await assertDocBelongsToTeam(ctx, args.gameId, args.teamId);
    await ctx.db.patch(args.appearanceId, {
      endInning: args.inning,
      report: args.report,
    });
  },
});

export const getStats = query({
  args: { gameId: v.id("games"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    const appearances = await ctx.db
      .query("pitcherAppearances")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    const results = [];
    for (const app of appearances) {
      const pitches = await ctx.db
        .query("pitchLogs")
        .withIndex("by_appearance", (q) => q.eq("appearanceId", app._id))
        .collect();
      const player = await ctx.db.get(app.playerId);
      results.push({
        appearanceId: app._id,
        playerId: app.playerId,
        playerName: player?.name ?? "Unknown",
        startInning: app.startInning,
        endInning: app.endInning,
        pitchCount: app.pitchCount,
        report: app.report,
        pitches: pitches.map((p) => ({
          isStrike: p.isStrike,
          velocity: p.velocity,
          newBatter: p.newBatter,
          endOfAtBat: p.endOfAtBat,
          atBatResult: p.atBatResult,
          timestamp: p.timestamp,
        })),
      });
    }
    return results;
  },
});

export const getStaffAvailability = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    const players = await ctx.db
      .query("players")
      .withIndex("by_team_and_type", (q) => q.eq("teamId", args.teamId).eq("isOurPlayer", true))
      .collect();
    const pitchers = [];
    for (const player of players) {
      const stats = await ctx.db
        .query("playerSeasonStats")
        .withIndex("by_player", (q) => q.eq("playerId", player._id))
        .first();
      if (stats?.pitching) {
        pitchers.push({
          playerId: player._id,
          name: player.name,
          number: player.number,
          pitching: stats.pitching,
        });
      }
    }
    return pitchers;
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertTeamAccess, assertWriteAccess, assertDocBelongsToTeam } from "./helpers";

export const addBudgetEntry = mutation({
  args: {
    teamId: v.id("teams"),
    weekendDate: v.string(),
    playerName: v.string(),
    saturdayPitches: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    const existing = await ctx.db
      .query("pitchBudgets")
      .withIndex("by_team_and_weekend", (q) =>
        q.eq("teamId", args.teamId).eq("weekendDate", args.weekendDate)
      )
      .collect();
    const playerEntry = existing.find((e) => e.playerName === args.playerName);
    if (playerEntry) {
      await ctx.db.patch(playerEntry._id, {
        saturdayPitches: args.saturdayPitches,
        notes: args.notes,
      });
    } else {
      await ctx.db.insert("pitchBudgets", {
        teamId: args.teamId,
        weekendDate: args.weekendDate,
        playerName: args.playerName,
        saturdayPitches: args.saturdayPitches,
        notes: args.notes,
      });
    }
  },
});

export const removeBudgetEntry = mutation({
  args: { entryId: v.id("pitchBudgets"), teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertWriteAccess(ctx, args.teamId);
    await assertDocBelongsToTeam(ctx, args.entryId, args.teamId);
    await ctx.db.delete(args.entryId);
  },
});

export const getBudgetForWeekend = query({
  args: { teamId: v.id("teams"), weekendDate: v.string() },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db
      .query("pitchBudgets")
      .withIndex("by_team_and_weekend", (q) =>
        q.eq("teamId", args.teamId).eq("weekendDate", args.weekendDate)
      )
      .collect();
  },
});

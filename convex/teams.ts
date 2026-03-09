import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, assertTeamAccess, assertOwnerAccess } from "./helpers";

export const listMyTeams = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const memberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const teams = await Promise.all(
      memberships.map((m) => ctx.db.get(m.teamId))
    );
    return teams.filter(Boolean);
  },
});

export const create = mutation({
  args: { name: v.string(), season: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const teamId = await ctx.db.insert("teams", {
      name: args.name,
      season: args.season,
      ownerId: userId,
    });
    await ctx.db.insert("teamMembers", {
      teamId,
      userId,
      role: "owner",
    });
    return teamId;
  },
});

export const getTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await assertTeamAccess(ctx, args.teamId);
    return await ctx.db.get(args.teamId);
  },
});

export const inviteMember = mutation({
  args: { teamId: v.id("teams"), userId: v.string(), role: v.union(v.literal("coach"), v.literal("viewer")) },
  handler: async (ctx, args) => {
    await assertOwnerAccess(ctx, args.teamId);
    await ctx.db.insert("teamMembers", {
      teamId: args.teamId,
      userId: args.userId,
      role: args.role,
    });
  },
});

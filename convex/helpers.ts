import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.tokenIdentifier;
}

export async function assertTeamAccess(ctx: QueryCtx | MutationCtx, teamId: Id<"teams">): Promise<string> {
  const userId = await getAuthUserId(ctx);
  const member = await ctx.db
    .query("teamMembers")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect();
  const isMember = member.some((m) => m.userId === userId);
  if (!isMember) throw new Error("Not a member of this team");
  return userId;
}

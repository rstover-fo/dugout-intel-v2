import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.tokenIdentifier;
}

export type TeamRole = "owner" | "coach" | "viewer";

export async function assertTeamAccess(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">
): Promise<{ userId: string; role: TeamRole }> {
  const userId = await getAuthUserId(ctx);
  const members = await ctx.db
    .query("teamMembers")
    .withIndex("by_team", (q) => q.eq("teamId", teamId))
    .collect();
  const member = members.find((m) => m.userId === userId);
  if (!member) throw new Error("Not a member of this team");
  return { userId, role: member.role as TeamRole };
}

export async function assertWriteAccess(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">
): Promise<{ userId: string; role: TeamRole }> {
  const result = await assertTeamAccess(ctx, teamId);
  if (result.role === "viewer") throw new Error("Viewers cannot modify team data");
  return result;
}

export async function assertOwnerAccess(
  ctx: QueryCtx | MutationCtx,
  teamId: Id<"teams">
): Promise<{ userId: string; role: TeamRole }> {
  const result = await assertTeamAccess(ctx, teamId);
  if (result.role !== "owner") throw new Error("Only team owners can perform this action");
  return result;
}

export async function assertDocBelongsToTeam(
  ctx: QueryCtx | MutationCtx,
  docId: Id<any>,
  teamId: Id<"teams">
): Promise<any> {
  const doc = await ctx.db.get(docId);
  if (!doc) throw new Error("Document not found");
  const record = doc as Record<string, unknown>;
  if (record.teamId !== teamId) throw new Error("Document not found");
  return doc;
}

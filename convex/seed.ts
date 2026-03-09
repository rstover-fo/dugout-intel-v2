import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./helpers";

const OUR_PITCHERS = [
  { name: "Sidor #1", number: "1", position: "P/SS", ppi: 16.0, fps: 55.8, bb: 0.58, fatiguePoint: 35 },
  { name: "Grawunder #2", number: "2", position: "P/2B", ppi: 22.8, fps: 53.4, bb: 0.88, fatiguePoint: 28 },
  { name: "C. Duhon #99", number: "99", position: "P/3B", ppi: 25.7, fps: 58.0, bb: 1.26, fatiguePoint: 28 },
  { name: "Corriveau #23", number: "23", position: "P/OF", ppi: 29.6, fps: 42.5, bb: 2.0, fatiguePoint: 25 },
  { name: "Cooper #5", number: "5", position: "P/1B", ppi: 15.5, fps: 47.0, bb: 1.0, fatiguePoint: 30 },
  { name: "Stover #12", number: "12", position: "P/C", ppi: 20.0, fps: 45.0, bb: 1.5, fatiguePoint: 28 },
  { name: "Quigley #8", number: "8", position: "P/OF", ppi: 18.0, fps: 50.0, bb: 1.2, fatiguePoint: 30 },
  { name: "J. Duhon #10", number: "10", position: "P/SS", ppi: 22.0, fps: 48.0, bb: 1.4, fatiguePoint: 25 },
  { name: "G. Duhon #11", number: "11", position: "P/OF", ppi: 24.0, fps: 44.0, bb: 1.8, fatiguePoint: 25 },
  { name: "Hebert #4", number: "4", position: "P/2B", ppi: 20.0, fps: 46.0, bb: 1.3, fatiguePoint: 28 },
];

const OUR_BATTING_ORDER = [
  { name: "Sidor", number: "1", position: "SS", avg: 0.438, obp: 0.567, slg: 0.625, risp: 0.500, so: 3, bb: 9, sb: 8, ct: 6, xbh: 3 },
  { name: "C. Duhon", number: "99", position: "3B", avg: 0.414, obp: 0.500, slg: 0.552, risp: 0.429, so: 4, bb: 3, sb: 4, ct: 4, xbh: 4 },
  { name: "Grawunder", number: "2", position: "2B", avg: 0.387, obp: 0.455, slg: 0.548, risp: 0.375, so: 5, bb: 2, sb: 3, ct: 5, xbh: 5 },
  { name: "Cooper", number: "5", position: "1B", avg: 0.355, obp: 0.448, slg: 0.484, risp: 0.333, so: 5, bb: 3, sb: 2, ct: 3, xbh: 4 },
  { name: "Stover", number: "12", position: "C", avg: 0.345, obp: 0.433, slg: 0.483, risp: 0.364, so: 4, bb: 3, sb: 1, ct: 4, xbh: 4 },
  { name: "Corriveau", number: "23", position: "LF", avg: 0.310, obp: 0.379, slg: 0.414, risp: 0.286, so: 7, bb: 2, sb: 5, ct: 3, xbh: 3 },
  { name: "Quigley", number: "8", position: "CF", avg: 0.286, obp: 0.370, slg: 0.357, risp: 0.250, so: 6, bb: 3, sb: 6, ct: 2, xbh: 2 },
  { name: "J. Duhon", number: "10", position: "RF", avg: 0.241, obp: 0.333, slg: 0.310, risp: 0.200, so: 8, bb: 3, sb: 3, ct: 2, xbh: 2 },
  { name: "G. Duhon", number: "11", position: "DH", avg: 0.207, obp: 0.296, slg: 0.276, risp: 0.167, so: 9, bb: 3, sb: 2, ct: 1, xbh: 2 },
  { name: "Hebert", number: "4", position: "2B", avg: 0.185, obp: 0.280, slg: 0.222, risp: 0.143, so: 10, bb: 3, sb: 1, ct: 1, xbh: 1 },
];

export const seedTeam = mutation({
  args: { teamName: v.string(), season: v.string() },
  handler: async (ctx, args) => {
    const ownerId = await getAuthUserId(ctx);

    // Check if team already exists
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();
    if (existing.some((t) => t.name === args.teamName)) {
      return { status: "skipped", message: "Team already exists" };
    }

    // Create team
    const teamId = await ctx.db.insert("teams", {
      name: args.teamName,
      season: args.season,
      ownerId,
    });
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: ownerId,
      role: "owner",
    });

    // Add pitchers with stats
    for (const pitcher of OUR_PITCHERS) {
      const batter = OUR_BATTING_ORDER.find((b) => b.number === pitcher.number);
      const playerId = await ctx.db.insert("players", {
        teamId,
        name: pitcher.name,
        number: pitcher.number,
        position: pitcher.position,
        isOurPlayer: true,
      });
      if (batter) {
        await ctx.db.insert("playerSeasonStats", {
          playerId,
          season: args.season,
          avg: batter.avg,
          obp: batter.obp,
          slg: batter.slg,
          risp: batter.risp,
          so: batter.so,
          bb: batter.bb,
          sb: batter.sb,
          ct: batter.ct,
          xbh: batter.xbh,
          pitching: {
            ppi: pitcher.ppi,
            fps: pitcher.fps,
            bbPerInning: pitcher.bb,
            fatiguePoint: pitcher.fatiguePoint,
          },
        });
      }
    }

    return { status: "seeded", teamId };
  },
});

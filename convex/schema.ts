import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  teams: defineTable({
    name: v.string(),
    season: v.string(),
    ownerId: v.string(),
  }).index("by_owner", ["ownerId"]),

  teamMembers: defineTable({
    teamId: v.id("teams"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("coach"), v.literal("viewer")),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["userId"]),

  players: defineTable({
    teamId: v.id("teams"),
    name: v.string(),
    number: v.string(),
    position: v.string(),
    isOurPlayer: v.boolean(),
    opponentTeamName: v.optional(v.string()),
    threat: v.optional(v.string()),
    notes: v.optional(v.string()),
    defenseNotes: v.optional(v.string()),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_type", ["teamId", "isOurPlayer"])
    .index("by_opponent", ["teamId", "opponentTeamName"]),

  playerSeasonStats: defineTable({
    playerId: v.id("players"),
    season: v.string(),
    avg: v.number(),
    obp: v.number(),
    slg: v.number(),
    risp: v.number(),
    so: v.number(),
    bb: v.number(),
    sb: v.number(),
    ct: v.number(),
    xbh: v.number(),
    pitching: v.optional(v.object({
      ppi: v.number(),
      fps: v.number(),
      bbPerInning: v.number(),
      fatiguePoint: v.number(),
    })),
  }).index("by_player", ["playerId"]),

  games: defineTable({
    teamId: v.id("teams"),
    opponent: v.string(),
    date: v.number(),
    status: v.union(v.literal("pregame"), v.literal("live"), v.literal("completed")),
    ourScore: v.number(),
    theirScore: v.number(),
    inning: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_status", ["teamId", "status"]),

  pitcherAppearances: defineTable({
    gameId: v.id("games"),
    playerId: v.id("players"),
    startInning: v.number(),
    endInning: v.optional(v.number()),
    pitchCount: v.number(),
    report: v.optional(v.string()),
  }).index("by_game", ["gameId"]),

  pitchLogs: defineTable({
    appearanceId: v.id("pitcherAppearances"),
    gameId: v.id("games"),
    isStrike: v.boolean(),
    velocity: v.optional(v.number()),
    newBatter: v.boolean(),
    endOfAtBat: v.boolean(),
    atBatResult: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_appearance", ["appearanceId"])
    .index("by_game", ["gameId"]),

  atBatResults: defineTable({
    gameId: v.id("games"),
    playerId: v.id("players"),
    results: v.array(v.string()),
  })
    .index("by_game", ["gameId"])
    .index("by_player", ["playerId"]),

  opponentPitcherLogs: defineTable({
    gameId: v.id("games"),
    pitcherName: v.string(),
    strikes: v.number(),
    balls: v.number(),
    velocities: v.array(v.number()),
  }).index("by_game", ["gameId"]),

  pitchBudgets: defineTable({
    teamId: v.id("teams"),
    weekendDate: v.string(),
    playerName: v.string(),
    saturdayPitches: v.number(),
    notes: v.optional(v.string()),
  }).index("by_team_and_weekend", ["teamId", "weekendDate"]),
});

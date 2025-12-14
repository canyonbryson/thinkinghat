// apps/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * ThinkingHat Convex Schema
 *
 * Core concepts:
 * - users: optional local user profile linked to Clerk
 * - rooms: game sessions identified by room code
 * - players: players in a room (host, player, spectator)
 * - gameStates: serialized game state per room (per game)
 * - puzzles: core content, seeded + user-generated
 * - puzzleRatings: per-user rating (1–5) for puzzles
 * - puzzleFlags: per-user flags for puzzles (inappropriate/broken/etc.)
 * - userProgress: per-user per-game difficulty stats (for leaderboards)
 * - categories: dynamic categories per game (phrases, movies, objects, etc.)
 */

export default defineSchema({
  // Optional local user profile, keyed by Clerk user id.
  users: defineTable({
    clerkUserId: v.string(),       // from Clerk
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))), // user role (defaults to "user")
    createdAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_lastSeenAt", ["lastSeenAt"]),

  /**
   * Games
   *
   * The master list of games shown in the UI.
   * (We keep name/description as i18n keys so web/mobile can translate locally.)
   */
  games: defineTable({
    gameId: v.string(), // e.g. "mumbled" | "rebus" | "riddles"
    nameKey: v.string(), // e.g. "game.mumbled.name"
    descriptionKey: v.optional(v.string()), // e.g. "game.mumbled.description"
    status: v.union(v.literal("comingSoon"), v.literal("active")),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_sortOrder", ["sortOrder"]),

  /**
   * Rooms
   *
   * Each game session has:
   * - room code (for joining)
   * - gameId (e.g. "mumbled", "rebus", "riddles")
   * - mode (single / two-player / party)
   * - playType (online / local)
   * - hostUserId (Clerk user id)
   */
  rooms: defineTable({
    code: v.string(), // unique-ish room code shown to players
    gameId: v.string(), // e.g. "mumbled" | "rebus" | "riddles"
    mode: v.union(
      v.literal("single"),
      v.literal("two-player"),
      v.literal("party")
    ),
    playType: v.union(
      v.literal("online"),
      v.literal("local"),
    ),
    // Host identity: either a Clerk user or a guest.
    hostUserId: v.optional(v.string()), // Clerk user id
    hostGuestId: v.optional(v.string()), // guest id
    status: v.union(
      v.literal("lobby"),
      v.literal("inProgress"),
      v.literal("finished")
    ),
    config: v.optional(v.any()), // per-game config (categories, difficulty filters, etc.)
    currentRound: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_hostUserId", ["hostUserId"])
    .index("by_gameId_status", ["gameId", "status"]),

  /**
   * Players
   *
   * A player is tied to a room and optionally a Clerk user.
   * Connection state supports reconnection logic.
   */
  players: defineTable({
    roomId: v.id("rooms"),
    userId: v.optional(v.string()), // Clerk user id (null for guests if you allow that)
    guestId: v.optional(v.string()),
    displayName: v.string(),
    role: v.union(
      v.literal("host"),
      v.literal("player"),
      v.literal("spectator")
    ),
    isReady: v.boolean(),
    isConnected: v.boolean(),
    lastSeenAt: v.number(),
    score: v.number(),
    // Optional: device or client id for finer reconnection
    clientId: v.optional(v.string()),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_userId", ["roomId", "userId"])
    .index("by_roomId_guestId", ["roomId", "guestId"])
    .index("by_userId", ["userId"]),

  /**
   * Game States
   *
   * One document per room, holding the canonical game state
   * for the current game instance.
   */
  gameStates: defineTable({
    roomId: v.id("rooms"),
    gameId: v.string(), // should match rooms.gameId
    state: v.any(),     // opaque serialized state managed by game engine
    round: v.number(),
    updatedAt: v.number(),
  }).index("by_roomId", ["roomId"]),

  /**
   * Categories (dynamic)
   *
   * Dynamic categories per game: "Common Phrases", "Movie Titles", etc.
   * Allows adding/removing categories without code changes.
   */
  categories: defineTable({
    gameId: v.string(),   // "mumbled", "rebus", "riddles" etc.
    slug: v.string(),     // e.g. "common-phrases"
    label: v.string(),    // e.g. "Common Phrases"
    description: v.optional(v.string()),
    isDefault: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_gameId_slug", ["gameId", "slug"]),

  /**
   * Puzzles
   *
   * Shared table for all puzzles across all games.
   * - Can be seeded via JSON/JSONL
   * - Can also be user-generated (Creative Mode)
   *
   * Stats:
   * - attempts / completions for global performance
   * - ratingSum / ratingCount for quality
   * - flagCount for moderation
   */
  puzzles: defineTable({
    gameId: v.string(),      // "mumbled" | "rebus" | "riddles" | future games
    categoryId: v.optional(v.id("categories")),
    categorySlug: v.optional(v.string()), // convenience for seeding

    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),

    // Structured puzzle data, varies per game:
    //
    // - Mumbled: { type: "mumbled", text: "Sigh Cub Her Monday" }
    // - Rebus:   { type: "rebus", layout: [...], ... }
    // - Riddles: { type: "riddle", prompt: "I'm floating right behind" }
    //
    // Use a discriminated union at the app level; here we store generic JSON.
    data: v.object({
      type: v.string(), // "mumbled" | "rebus" | "riddle" | ...
      payload: v.any(),
    }),

    answer: v.string(),

    // User-generated metadata
    isUserGenerated: v.boolean(),
    createdByUserId: v.optional(v.string()),

    // Ratings & flags (denormalized aggregates)
    ratingCount: v.number(),
    ratingSum: v.number(), // sum of 1–5 ratings
    flagCount: v.number(),

    // Puzzle-level stats
    attempts: v.number(),
    completions: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_gameId", ["gameId"])
    .index("by_gameId_difficulty", ["gameId", "difficulty"])
    .index("by_categoryId", ["categoryId"])
    .index("by_createdByUserId", ["createdByUserId"]),

  /**
   * Puzzle Ratings
   *
   * Per-user rating for a given puzzle (1–5).
   * Use this to prevent multiple votes per user and to maintain aggregates
   * on the puzzles table.
   */
  puzzleRatings: defineTable({
    puzzleId: v.id("puzzles"),
    userId: v.string(), // Clerk user id
    rating: v.number(), // 1–5
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_puzzleId", ["puzzleId"])
    .index("by_puzzleId_userId", ["puzzleId", "userId"])
    .index("by_userId", ["userId"]),

  /**
   * Puzzle Flags
   *
   * Tracks which users flagged which puzzles and why.
   * Aggregate flagCount is kept in puzzles.flagCount.
   */
  puzzleFlags: defineTable({
    puzzleId: v.id("puzzles"),
    userId: v.string(), // Clerk user id
    reason: v.optional(v.string()), // "offensive", "broken", etc.
    createdAt: v.number(),
  })
    .index("by_puzzleId", ["puzzleId"])
    .index("by_puzzleId_userId", ["puzzleId", "userId"])
    .index("by_userId", ["userId"]),

  /**
   * User Progress
   *
   * Per-user, per-game difficulty stats for leaderboards and unlocks.
   * (e.g. Creative Mode unlock after 10 Hard solves.)
   */
  userProgress: defineTable({
    userId: v.string(),   // Clerk user id
    gameId: v.string(),   // "mumbled" | "rebus" | "riddles" | ...
    easySolved: v.number(),
    mediumSolved: v.number(),
    hardSolved: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_gameId", ["userId", "gameId"])
    .index("by_gameId_hardSolved", ["gameId", "hardSolved"]), // basic leaderboard helper

  /**
   * (Optional) Puzzle Attempts / Events
   *
   * If you want more granular analytics, you can later add a table like:
   *
   * puzzleAttempts: {
   *   puzzleId,
   *   userId,
   *   roomId,
   *   correct,
   *   timeToSolveMs,
   *   createdAt,
   * }
   *
   * For now, we stick with aggregated stats in `puzzles` and `userProgress`.
   */
});


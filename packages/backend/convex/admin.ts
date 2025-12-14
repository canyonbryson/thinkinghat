import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { isAdminIdentity, requireAdmin } from "./lib/auth";
import type { Id } from "./_generated/dataModel";

/**
 * Admin-only CRUD operations for puzzles (game answers)
 */

export const checkAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      console.log("identity", identity);
      if (!identity?.subject) {
        return { isAdmin: false };
      }

      // Check Clerk metadata/claims first
      if (isAdminIdentity(identity)) return { isAdmin: true };

      // Fall back to database role check (for backwards compatibility)
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", identity.subject))
        .first();
      return { isAdmin: (user?.role ?? "user") === "admin" };
    } catch {
      return { isAdmin: false };
    }
  },
});

export const listPuzzles = query({
  args: {
    gameId: v.optional(v.string()),
    categorySlug: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let puzzles = await ctx.db
      .query("puzzles")
      .withIndex("by_gameId", (q) => (args.gameId ? q.eq("gameId", args.gameId) : q))
      .collect();

    // Apply filters
    if (args.categorySlug) {
      puzzles = puzzles.filter((p) => p.categorySlug === args.categorySlug);
    }
    if (args.difficulty) {
      puzzles = puzzles.filter((p) => p.difficulty === args.difficulty);
    }

    // Sort by creation date (newest first)
    puzzles.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    if (args.limit) {
      puzzles = puzzles.slice(0, args.limit);
    }

    return puzzles;
  },
});

export const getPuzzle = query({
  args: { puzzleId: v.id("puzzles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.puzzleId);
  },
});

export const createPuzzle = mutation({
  args: {
    gameId: v.string(),
    categorySlug: v.optional(v.string()),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    data: v.object({
      type: v.string(),
      payload: v.any(),
    }),
    answer: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireAdmin(ctx);
    const now = Date.now();

    // Resolve category if provided
    let categoryId: Id<"categories"> | undefined;
    if (args.categorySlug) {
      const category = await ctx.db
        .query("categories")
        .withIndex("by_gameId_slug", (q) => q.eq("gameId", args.gameId).eq("slug", args.categorySlug!))
        .first();
      categoryId = category?._id;
    }

    const puzzleId = await ctx.db.insert("puzzles", {
      gameId: args.gameId,
      categoryId,
      categorySlug: args.categorySlug,
      difficulty: args.difficulty,
      data: args.data,
      answer: args.answer,
      isUserGenerated: false,
      createdByUserId: userId,
      ratingCount: 0,
      ratingSum: 0,
      flagCount: 0,
      attempts: 0,
      completions: 0,
      createdAt: now,
      updatedAt: now,
    });

    return { puzzleId };
  },
});

export const updatePuzzle = mutation({
  args: {
    puzzleId: v.id("puzzles"),
    categorySlug: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    data: v.optional(
      v.object({
        type: v.string(),
        payload: v.any(),
      })
    ),
    answer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const puzzle = await ctx.db.get(args.puzzleId);
    if (!puzzle) throw new Error("Puzzle not found");

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.categorySlug !== undefined) {
      // Resolve category if provided
      let categoryId: Id<"categories"> | undefined;
      const slug = args.categorySlug;
      if (slug) {
        const category = await ctx.db
          .query("categories")
          .withIndex("by_gameId_slug", (q) => q.eq("gameId", puzzle.gameId).eq("slug", slug))
          .first();
        categoryId = category?._id;
      }
      updates.categoryId = categoryId;
      updates.categorySlug = args.categorySlug;
    }

    if (args.difficulty !== undefined) {
      updates.difficulty = args.difficulty;
    }
    if (args.data !== undefined) {
      updates.data = args.data;
    }
    if (args.answer !== undefined) {
      updates.answer = args.answer;
    }

    await ctx.db.patch(args.puzzleId, updates);
    return { success: true };
  },
});

export const deletePuzzle = mutation({
  args: { puzzleId: v.id("puzzles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.puzzleId);
    return { success: true };
  },
});

export const listCategories = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("categories")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});

export const listGames = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("games")
      .withIndex("by_sortOrder")
      .collect();
  },
});

/**
 * Set a user's role (admin only)
 * Useful for initial admin setup
 */
export const setUserRole = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    
    if (user) {
      await ctx.db.patch(user._id, { role: args.role });
    } else {
      // Create user if doesn't exist
      await ctx.db.insert("users", {
        clerkUserId: args.clerkUserId,
        displayName: "Admin User",
        role: args.role,
        createdAt: Date.now(),
        lastSeenAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});


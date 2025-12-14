import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./lib/auth";

// Internal helper for seeding games (shared by both public and internal mutations)
async function seedGamesData(ctx: any) {
  const now = Date.now();
  const defaults = [
    {
      gameId: "mumbled",
      nameKey: "game.mumbled.name",
      descriptionKey: "game.mumbled.description",
      status: "active" as const,
      sortOrder: 1,
    },
    {
      gameId: "rebus",
      nameKey: "game.rebus.name",
      descriptionKey: "game.rebus.description",
      status: "comingSoon" as const,
      sortOrder: 2,
    },
    {
      gameId: "riddles",
      nameKey: "game.riddles.name",
      descriptionKey: "game.riddles.description",
      status: "comingSoon" as const,
      sortOrder: 3,
    },
  ];

  let inserted = 0;
  let updated = 0;
  for (const g of defaults) {
    const existing = await ctx.db
      .query("games")
      .withIndex("by_gameId", (q: any) => q.eq("gameId", g.gameId))
      .first();

    if (!existing) {
      await ctx.db.insert("games", { ...g, createdAt: now, updatedAt: now });
      inserted++;
    } else {
      await ctx.db.patch(existing._id, { ...g, updatedAt: now });
      updated++;
    }
  }

  return { inserted, updated };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("games")
      .withIndex("by_sortOrder")
      .collect();
  },
});

export const listCategories = query({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUserId(ctx);
    return await seedGamesData(ctx);
  },
});

// Internal mutation for CLI seeding (no auth required)
export const seedDefaultsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await seedGamesData(ctx);
  },
});



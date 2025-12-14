import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getActor } from "./lib/auth";

export const getPublicByRoom = query({
  args: { roomId: v.id("rooms"), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });

    const player =
      actor.kind === "user"
        ? await ctx.db
            .query("players")
            .withIndex("by_roomId_userId", (q) => q.eq("roomId", args.roomId).eq("userId", actor.userId))
            .first()
        : await ctx.db
            .query("players")
            .withIndex("by_roomId_guestId", (q) => q.eq("roomId", args.roomId).eq("guestId", actor.guestId))
            .first();
    if (!player) return null;

    const gameState = await ctx.db
      .query("gameStates")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (!gameState) return null;

    // Placeholder until real per-game engines are wired in.
    return { round: gameState.round, state: gameState.state };
  },
});

export const dispatch = mutation({
  args: { roomId: v.id("rooms"), action: v.any(), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const now = Date.now();

    const player =
      actor.kind === "user"
        ? await ctx.db
            .query("players")
            .withIndex("by_roomId_userId", (q) => q.eq("roomId", args.roomId).eq("userId", actor.userId))
            .first()
        : await ctx.db
            .query("players")
            .withIndex("by_roomId_guestId", (q) => q.eq("roomId", args.roomId).eq("guestId", actor.guestId))
            .first();
    if (!player) throw new Error("Not in room");

    const gameState = await ctx.db
      .query("gameStates")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!gameState) throw new Error("Game state missing");

    // Store the last action for debugging; real game engines will replace this.
    await ctx.db.patch(gameState._id, {
      state: {
        ...(gameState.state ?? {}),
        lastAction: args.action,
        lastActorUserId: actor.kind === "user" ? actor.userId : null,
        lastActorGuestId: actor.kind === "guest" ? actor.guestId : null,
        lastUpdatedAt: now,
      },
      updatedAt: now,
    });

    return { ok: true };
  },
});



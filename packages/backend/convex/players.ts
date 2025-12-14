import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getActor, getUserIdentity } from "./lib/auth";
import { defaultJoinRole } from "./lib/session";

export const listByRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();
  },
});

export const joinByCode = mutation({
  args: {
    code: v.string(),
    displayName: v.optional(v.string()),
    clientId: v.optional(v.string()),
    guestId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const identity = actor.kind === "user" ? await getUserIdentity(ctx) : null;
    const now = Date.now();

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
    if (!room) throw new Error("Room not found");

    const existing =
      actor.kind === "user"
        ? await ctx.db
            .query("players")
            .withIndex("by_roomId_userId", (q) => q.eq("roomId", room._id).eq("userId", actor.userId))
            .first()
        : await ctx.db
            .query("players")
            .withIndex("by_roomId_guestId", (q) => q.eq("roomId", room._id).eq("guestId", actor.guestId))
            .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isConnected: true,
        lastSeenAt: now,
        clientId: args.clientId ?? existing.clientId,
      });
      return { roomId: room._id, playerId: existing._id, role: existing.role };
    }

    const existingPlayers = await ctx.db
      .query("players")
      .withIndex("by_roomId", (q) => q.eq("roomId", room._id))
      .collect();

    const role = defaultJoinRole(
      room.mode,
      existingPlayers.map((p) => p.role)
    );

    const computedName =
      args.displayName ??
      (identity as any)?.name ??
      (identity as any)?.nickname ??
      (identity as any)?.email ??
      "Player";

    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      userId: actor.kind === "user" ? actor.userId : undefined,
      guestId: actor.kind === "guest" ? actor.guestId : undefined,
      displayName: computedName,
      role,
      isReady: room.mode === "single" && role !== "spectator",
      isConnected: true,
      lastSeenAt: now,
      score: 0,
      clientId: args.clientId,
    });

    return { roomId: room._id, playerId, role };
  },
});

export const setReady = mutation({
  args: { roomId: v.id("rooms"), isReady: v.boolean(), guestId: v.optional(v.string()) },
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
    if (!player) throw new Error("Player not found");

    await ctx.db.patch(player._id, { isReady: args.isReady, lastSeenAt: now, isConnected: true });
    return { ok: true };
  },
});

export const leave = mutation({
  args: { roomId: v.id("rooms"), guestId: v.optional(v.string()) },
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
    if (!player) return { ok: true };

    await ctx.db.patch(player._id, { isConnected: false, lastSeenAt: now });
    return { ok: true };
  },
});

export const heartbeat = mutation({
  args: { roomId: v.id("rooms"), guestId: v.optional(v.string()) },
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
    if (!player) return { ok: false };

    await ctx.db.patch(player._id, { isConnected: true, lastSeenAt: now });
    return { ok: true };
  },
});



import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getActor, getUserIdentity } from "./lib/auth";
import { generateRoomCode } from "./lib/roomCode";
import { computeCanStart, type SessionPlayer } from "./lib/session";
import { initMumbledForRoom } from "./mumbled";

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
  },
});

export const create = mutation({
  args: {
    gameId: v.string(),
    mode: v.union(v.literal("single"), v.literal("two-player"), v.literal("party")),
    playType: v.union(v.literal("online"), v.literal("local")),
    config: v.optional(v.any()),
    clientId: v.optional(v.string()),
    guestId: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const identity = actor.kind === "user" ? await getUserIdentity(ctx) : null;
    const now = Date.now();

    // generate a code that doesn't collide
    let code = "";
    for (let i = 0; i < 10; i++) {
      const candidate = generateRoomCode(5);
      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_code", (q) => q.eq("code", candidate))
        .first();
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) throw new Error("Failed to generate room code");

    const roomId = await ctx.db.insert("rooms", {
      code,
      gameId: args.gameId,
      mode: args.mode,
      playType: args.playType,
      hostUserId: actor.kind === "user" ? actor.userId : undefined,
      hostGuestId: actor.kind === "guest" ? actor.guestId : undefined,
      status: "lobby",
      config: args.config,
      currentRound: 0,
      createdAt: now,
      updatedAt: now,
    });

    const displayName =
      args.displayName ??
      (identity as any)?.name ??
      (identity as any)?.nickname ??
      (identity as any)?.email ??
      "Player";

    const hostPlayerId = await ctx.db.insert("players", {
      roomId,
      userId: actor.kind === "user" ? actor.userId : undefined,
      guestId: actor.kind === "guest" ? actor.guestId : undefined,
      displayName,
      role: "host",
      isReady: args.mode === "single",
      isConnected: true,
      lastSeenAt: now,
      score: 0,
      clientId: args.clientId,
    });

    // Create placeholder state doc so clients can subscribe immediately.
    await ctx.db.insert("gameStates", {
      roomId,
      gameId: args.gameId,
      state: { kind: "placeholder" },
      round: 0,
      updatedAt: now,
    });

    return { roomId, code, hostPlayerId };
  },
});

export const start = mutation({
  args: { roomId: v.id("rooms"), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const now = Date.now();

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (
      (actor.kind === "user" && room.hostUserId !== actor.userId) ||
      (actor.kind === "guest" && room.hostGuestId !== actor.guestId)
    ) {
      throw new Error("Only host can start");
    }
    if (room.status !== "lobby") throw new Error("Room already started");

    const players = await ctx.db
      .query("players")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .collect();

    const sessionPlayers: SessionPlayer[] = players.map((p) => ({
      id: p._id,
      userId: p.userId ?? null,
      displayName: p.displayName,
      role: p.role,
      score: p.score,
      isConnected: p.isConnected,
      isReady: p.isReady,
    }));

    const canStart = computeCanStart(room.mode, sessionPlayers);
    if (!canStart.ok) throw new Error(canStart.reason ?? "Cannot start");

    // Game-specific initialization (for now only Mumbled is implemented).
    if (room.gameId === "mumbled") {
      await initMumbledForRoom(ctx, args.roomId, room.config?.totalRounds, room.config?.categorySlug);
      return { started: true, gameId: "mumbled" };
    }

    await ctx.db.patch(args.roomId, { status: "inProgress", currentRound: 1, updatedAt: now });
    const gameState = await ctx.db
      .query("gameStates")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (gameState) await ctx.db.patch(gameState._id, { round: 1, updatedAt: now });
    return { started: true, gameId: room.gameId };
  },
});



import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getActor, requireUserId } from "./lib/auth";
import type { Id } from "./_generated/dataModel";

type MumbledPhase = "playing" | "roundOver" | "finished";

export interface MumbledState {
  kind: "mumbled";
  phase: MumbledPhase;
  round: number; // 1-based
  totalRounds: number;
  prompt: string;
  answer: string; // internal
  revealedAnswer?: string;
  winnerPlayerId?: Id<"players">;
  usedPuzzleIds: Id<"puzzles">[];
  scoreByPlayerId: Record<string, number>;
  categorySlug?: string; // optional category filter
  lastSubmission?: {
    byPlayerId: Id<"players">;
    byDisplayName: string;
    correct: boolean;
  };
}

function normalizeAnswer(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureSeeded(ctx: any) {
  const existing = await ctx.db
    .query("puzzles")
    .withIndex("by_gameId", (q: any) => q.eq("gameId", "mumbled"))
    .first();
  if (existing) return;

  const now = Date.now();
  // Category (optional linkage for now)
  const category = await ctx.db
    .query("categories")
    .withIndex("by_gameId_slug", (q: any) => q.eq("gameId", "mumbled").eq("slug", "common-phrases"))
    .first();

  const categoryId =
    category?._id ??
    (await ctx.db.insert("categories", {
      gameId: "mumbled",
      slug: "common-phrases",
      label: "Common Phrases",
      description: "Everyday phrases and sayings",
      isDefault: true,
      createdAt: now,
    }));

  const samples: Array<{ prompt: string; answer: string }> = [
    { prompt: "Sigh Cub Her Monday", answer: "Cyber Monday" },
    { prompt: "Fur Tin Eight", answer: "Fortunate" },
    { prompt: "Ape Hull", answer: "April" },
    { prompt: "Ache Heeve Mint", answer: "Achievement" },
    { prompt: "Chew Day", answer: "Tuesday" },
    { prompt: "Eggs Aim Shun", answer: "Examination" },
  ];

  for (const s of samples) {
    await ctx.db.insert("puzzles", {
      gameId: "mumbled",
      categoryId,
      categorySlug: "common-phrases",
      difficulty: "easy",
      data: {
        type: "mumbled",
        payload: { prompt: s.prompt },
      },
      answer: s.answer,
      isUserGenerated: false,
      ratingCount: 0,
      ratingSum: 0,
      flagCount: 0,
      attempts: 0,
      completions: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
}

async function pickNextPuzzle(ctx: any, used: Id<"puzzles">[], categorySlug?: string) {
  let puzzles = await ctx.db
    .query("puzzles")
    .withIndex("by_gameId", (q: any) => q.eq("gameId", "mumbled"))
    .collect();

  // Filter by category if specified
  if (categorySlug) {
    puzzles = puzzles.filter((p: any) => p.categorySlug === categorySlug);
  }

  const unused = puzzles.filter((p: any) => !used.includes(p._id));
  const pool = unused.length > 0 ? unused : puzzles;
  if (pool.length === 0) throw new Error("No puzzles found for Mumbled");

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] as { _id: Id<"puzzles">; data: any; answer: string };
}

function toPublic(state: MumbledState) {
  const { answer, ...rest } = state;
  if (state.phase === "roundOver" || state.phase === "finished") {
    return { ...rest, revealedAnswer: state.revealedAnswer ?? state.answer };
  }
  return rest;
}

async function requirePlayerInRoom(
  ctx: any,
  roomId: Id<"rooms">,
  actor: { kind: "user"; userId: string } | { kind: "guest"; guestId: string }
) {
  const player =
    actor.kind === "user"
      ? await ctx.db
          .query("players")
          .withIndex("by_roomId_userId", (q: any) => q.eq("roomId", roomId).eq("userId", actor.userId))
          .first()
      : await ctx.db
          .query("players")
          .withIndex("by_roomId_guestId", (q: any) => q.eq("roomId", roomId).eq("guestId", actor.guestId))
          .first();
  if (!player) throw new Error("Not in room");
  return player as { _id: Id<"players">; displayName: string; role: string; score: number };
}

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    // keep seeding restricted to authenticated users
    await requireUserId(ctx);
    await ensureSeeded(ctx);
    return { ok: true };
  },
});

// Internal mutation for CLI seeding (no auth required)
export const seedPuzzlesInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ensureSeeded(ctx);
    return { ok: true };
  },
});

export const getPublicState = query({
  args: { roomId: v.id("rooms"), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    await requirePlayerInRoom(ctx, args.roomId, actor);

    const gameState = await ctx.db
      .query("gameStates")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (!gameState) return null;

    const state = gameState.state as any;
    if (!state || state.kind !== "mumbled") return null;
    return toPublic(state as MumbledState);
  },
});

export const initOnStart = mutation({
  args: { roomId: v.id("rooms"), totalRounds: v.optional(v.number()), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (
      (actor.kind === "user" && room.hostUserId !== actor.userId) ||
      (actor.kind === "guest" && room.hostGuestId !== actor.guestId)
    ) {
      throw new Error("Only host can start");
    }

    await initMumbledForRoom(
      ctx,
      args.roomId,
      args.totalRounds ?? room.config?.totalRounds,
      room.config?.categorySlug
    );
    return { ok: true };
  },
});

export async function initMumbledForRoom(
  ctx: any,
  roomId: Id<"rooms">,
  totalRoundsInput?: number,
  categorySlug?: string
) {
  await ensureSeeded(ctx);

  const players = await ctx.db
    .query("players")
    .withIndex("by_roomId", (q: any) => q.eq("roomId", roomId))
    .collect();

  const usedPuzzleIds: Id<"puzzles">[] = [];
  const next = await pickNextPuzzle(ctx, usedPuzzleIds, categorySlug);
  usedPuzzleIds.push(next._id);

  const now = Date.now();
  const totalRounds = Math.max(1, totalRoundsInput ?? 5);

  const scoreByPlayerId: Record<string, number> = {};
  for (const p of players) scoreByPlayerId[p._id] = p.score ?? 0;

  const state: MumbledState = {
    kind: "mumbled",
    phase: "playing",
    round: 1,
    totalRounds,
    prompt: next.data?.payload?.prompt ?? "(missing prompt)",
    answer: next.answer,
    usedPuzzleIds,
    scoreByPlayerId,
    categorySlug,
  };

  const gs = await ctx.db
    .query("gameStates")
    .withIndex("by_roomId", (q: any) => q.eq("roomId", roomId))
    .first();
  if (!gs) throw new Error("Game state missing");

  await ctx.db.patch(gs._id, { state, round: 1, updatedAt: now });
  await ctx.db.patch(roomId, { status: "inProgress", currentRound: 1, updatedAt: now });
}

export const submitAnswer = mutation({
  args: { roomId: v.id("rooms"), answer: v.string(), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const player = await requirePlayerInRoom(ctx, args.roomId, actor);

    const gs = await ctx.db
      .query("gameStates")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (!gs) throw new Error("Game state missing");

    const state = gs.state as any;
    if (!state || state.kind !== "mumbled") throw new Error("Mumbled not initialized");
    const s = state as MumbledState;
    if (s.phase !== "playing") return { ok: false };

    const correct = normalizeAnswer(args.answer) === normalizeAnswer(s.answer);
    const now = Date.now();

    if (!correct) {
      const nextState: MumbledState = {
        ...s,
        lastSubmission: {
          byPlayerId: player._id,
          byDisplayName: player.displayName,
          correct: false,
        },
      };
      await ctx.db.patch(gs._id, { state: nextState, updatedAt: now });
      return { ok: true, correct: false };
    }

    // First correct wins; if already won, ignore.
    if (s.winnerPlayerId) return { ok: true, correct: false };

    const nextScore = (s.scoreByPlayerId[player._id] ?? player.score ?? 0) + 1;
    const nextState: MumbledState = {
      ...s,
      phase: s.round >= s.totalRounds ? "finished" : "roundOver",
      winnerPlayerId: player._id,
      revealedAnswer: s.answer,
      scoreByPlayerId: { ...s.scoreByPlayerId, [player._id]: nextScore },
      lastSubmission: {
        byPlayerId: player._id,
        byDisplayName: player.displayName,
        correct: true,
      },
    };

    await ctx.db.patch(gs._id, { state: nextState, updatedAt: now });
    await ctx.db.patch(player._id, { score: nextScore, lastSeenAt: now, isConnected: true });

    if (nextState.phase === "finished") {
      await ctx.db.patch(args.roomId, { status: "finished", updatedAt: now });
    }

    return { ok: true, correct: true };
  },
});

export const nextRound = mutation({
  args: { roomId: v.id("rooms"), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const player = await requirePlayerInRoom(ctx, args.roomId, actor);

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (
      (actor.kind === "user" && room.hostUserId !== actor.userId) ||
      (actor.kind === "guest" && room.hostGuestId !== actor.guestId)
    ) {
      throw new Error("Only host can advance");
    }

    const gs = await ctx.db
      .query("gameStates")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (!gs) throw new Error("Game state missing");

    const state = gs.state as any;
    if (!state || state.kind !== "mumbled") throw new Error("Mumbled not initialized");
    const s = state as MumbledState;
    if (s.phase !== "roundOver") return { ok: false };

    await ensureSeeded(ctx);
    const nextPuzzle = await pickNextPuzzle(ctx, s.usedPuzzleIds, s.categorySlug);
    const usedPuzzleIds = [...s.usedPuzzleIds, nextPuzzle._id];

    const now = Date.now();
    const nextRoundNumber = s.round + 1;
    const nextState: MumbledState = {
      ...s,
      phase: "playing",
      round: nextRoundNumber,
      prompt: nextPuzzle.data?.payload?.prompt ?? "(missing prompt)",
      answer: nextPuzzle.answer,
      revealedAnswer: undefined,
      winnerPlayerId: undefined,
      usedPuzzleIds,
      lastSubmission: undefined,
    };

    await ctx.db.patch(gs._id, { state: nextState, round: nextRoundNumber, updatedAt: now });
    await ctx.db.patch(args.roomId, { currentRound: nextRoundNumber, updatedAt: now });
    await ctx.db.patch(player._id, { lastSeenAt: now, isConnected: true });

    return { ok: true };
  },
});

export const skip = mutation({
  args: { roomId: v.id("rooms"), guestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const actor = await getActor(ctx, { guestId: args.guestId });
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (
      (actor.kind === "user" && room.hostUserId !== actor.userId) ||
      (actor.kind === "guest" && room.hostGuestId !== actor.guestId)
    ) {
      throw new Error("Only host can skip");
    }

    const gs = await ctx.db
      .query("gameStates")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    if (!gs) throw new Error("Game state missing");

    const state = gs.state as any;
    if (!state || state.kind !== "mumbled") throw new Error("Mumbled not initialized");
    const s = state as MumbledState;
    if (s.phase !== "playing") return { ok: false };

    const now = Date.now();
    const nextState: MumbledState = {
      ...s,
      phase: s.round >= s.totalRounds ? "finished" : "roundOver",
      revealedAnswer: s.answer,
      lastSubmission: {
        byPlayerId: (await requirePlayerInRoom(ctx, args.roomId, actor))._id,
        byDisplayName: "Host",
        correct: false,
      },
    };

    await ctx.db.patch(gs._id, { state: nextState, updatedAt: now });
    if (nextState.phase === "finished") {
      await ctx.db.patch(args.roomId, { status: "finished", updatedAt: now });
    }

    return { ok: true };
  },
});



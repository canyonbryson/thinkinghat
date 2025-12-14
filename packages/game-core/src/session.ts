import type { BaseAction, EnginePlayer, EngineRoom, GameError } from "./index";

export type RoomStatus = "lobby" | "inProgress" | "finished";

export type PlayerRole = EnginePlayer["role"];

export type SessionPlayer = EnginePlayer & {
  isReady: boolean;
};

export type PlatformAction =
  | { type: "PLAYER_SET_READY"; playerId: string; isReady: boolean }
  | { type: "HOST_START_GAME" }
  | { type: "HOST_END_GAME" }
  | { type: "GAME_ACTION"; action: BaseAction };

export interface CanStartResult {
  ok: boolean;
  reason?: string;
}

function isParticipant(p: SessionPlayer) {
  return p.role !== "spectator";
}

export function computeCanStart(
  room: Pick<EngineRoom, "mode">,
  players: SessionPlayer[]
): CanStartResult {
  const participants = players.filter(isParticipant);

  if (room.mode === "single") {
    if (participants.length < 1) return { ok: false, reason: "No player" };
    // Single player can start immediately; readiness is optional.
    return { ok: true };
  }

  if (room.mode === "two-player") {
    if (participants.length !== 2) {
      return { ok: false, reason: "Need exactly 2 players" };
    }
    if (!participants.every((p) => p.isReady)) {
      return { ok: false, reason: "All players must be ready" };
    }
    return { ok: true };
  }

  // party
  if (participants.length < 3) {
    return { ok: false, reason: "Need at least 3 players" };
  }
  if (!participants.every((p) => p.isReady)) {
    return { ok: false, reason: "All players must be ready" };
  }
  return { ok: true };
}

export function pickHost(players: EnginePlayer[]): EnginePlayer | undefined {
  return players.find((p) => p.role === "host") ?? players[0];
}

export function defaultJoinRole(
  room: Pick<EngineRoom, "mode">,
  existingPlayers: EnginePlayer[]
): PlayerRole {
  const participantCount = existingPlayers.filter((p) => p.role !== "spectator")
    .length;

  if (room.mode === "single") {
    return participantCount === 0 ? "host" : "spectator";
  }

  if (room.mode === "two-player") {
    if (participantCount === 0) return "host";
    if (participantCount === 1) return "player";
    return "spectator";
  }

  // party: first is host, everyone else default to player
  if (participantCount === 0) return "host";
  return "player";
}

export interface SessionMetaState {
  status: RoomStatus;
  startedAt?: number;
  endedAt?: number;
  round: number;
  turnIndex: number;
  activePlayerId?: string;
  turnOrder?: string[];
}

export function createInitialSessionMeta(now: number): SessionMetaState {
  return {
    status: "lobby",
    round: 0,
    turnIndex: 0,
    startedAt: undefined,
    endedAt: undefined,
    activePlayerId: undefined,
    turnOrder: undefined,
  };
}

export interface ApplyPlatformActionResult {
  meta: SessionMetaState;
  error?: GameError;
}

export function applyPlatformAction(
  meta: SessionMetaState,
  action: Exclude<PlatformAction, { type: "GAME_ACTION" }>,
  now: number
): ApplyPlatformActionResult {
  switch (action.type) {
    case "HOST_START_GAME": {
      if (meta.status !== "lobby") {
        return {
          meta,
          error: { code: "INVALID_STATE", message: "Game already started" },
        };
      }
      return { meta: { ...meta, status: "inProgress", startedAt: now } };
    }
    case "HOST_END_GAME": {
      if (meta.status === "finished") return { meta };
      return { meta: { ...meta, status: "finished", endedAt: now } };
    }
    case "PLAYER_SET_READY": {
      // Player readiness is stored on player docs (backend). No meta changes here.
      return { meta };
    }
    default: {
      return {
        meta,
        error: { code: "UNKNOWN_ACTION", message: "Unknown platform action" },
      };
    }
  }
}



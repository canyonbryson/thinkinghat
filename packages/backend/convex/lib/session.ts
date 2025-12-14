export type GameMode = "single" | "two-player" | "party";
export type PlayerRole = "host" | "player" | "spectator";

export interface SessionPlayer {
  id: string;
  role: PlayerRole;
  isReady: boolean;
}

export function computeCanStart(
  mode: GameMode,
  players: SessionPlayer[]
): { ok: boolean; reason?: string } {
  const participants = players.filter((p) => p.role !== "spectator");

  if (mode === "single") {
    if (participants.length < 1) return { ok: false, reason: "No player" };
    return { ok: true };
  }

  if (mode === "two-player") {
    if (participants.length !== 2) return { ok: false, reason: "Need exactly 2 players" };
    if (!participants.every((p) => p.isReady)) return { ok: false, reason: "All players must be ready" };
    return { ok: true };
  }

  // party
  if (participants.length < 3) return { ok: false, reason: "Need at least 3 players" };
  if (!participants.every((p) => p.isReady)) return { ok: false, reason: "All players must be ready" };
  return { ok: true };
}

export function defaultJoinRole(mode: GameMode, existingRoles: PlayerRole[]): PlayerRole {
  const participantCount = existingRoles.filter((r) => r !== "spectator").length;

  if (mode === "single") {
    return participantCount === 0 ? "host" : "spectator";
  }

  if (mode === "two-player") {
    if (participantCount === 0) return "host";
    if (participantCount === 1) return "player";
    return "spectator";
  }

  // party
  if (participantCount === 0) return "host";
  return "player";
}



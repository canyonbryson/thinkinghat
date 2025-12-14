/**
 * Turn helpers (Convex-agnostic).
 *
 * The platform doesn't enforce a specific turn system; this provides
 * simple utilities most games can reuse.
 */

export function normalizeTurnOrder(playerIds: string[]): string[] {
  // Stable + unique, preserve first occurrence
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of playerIds) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function pickInitialActivePlayer(turnOrder: string[]): string | undefined {
  return turnOrder[0];
}

export function nextActivePlayerId(
  turnOrder: string[],
  currentActivePlayerId?: string
): { activePlayerId?: string; turnIndex: number } {
  const order = normalizeTurnOrder(turnOrder);
  if (order.length === 0) return { activePlayerId: undefined, turnIndex: 0 };

  if (!currentActivePlayerId) {
    return { activePlayerId: order[0], turnIndex: 0 };
  }

  const idx = order.indexOf(currentActivePlayerId);
  const nextIndex = idx === -1 ? 0 : (idx + 1) % order.length;
  return { activePlayerId: order[nextIndex], turnIndex: nextIndex };
}



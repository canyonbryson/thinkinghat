// packages/game-core/src/index.ts

/**
 * ThinkingHat game-core
 *
 * Shared types and utilities for all games (Mumbled, Rebus, Riddles, etc.)
 *
 * This package is intentionally Convex-agnostic so it can be used on:
 * - server (Convex mutations/actions)
 * - client (web / mobile) for typing & local previews
 */

//
// 1. Basic shared types
//

export type GameId = "mumbled" | "rebus" | "riddles" | (string & {});

/**
 * High-level player modes, shared by all games.
 */
export type GameMode = "single" | "two-player" | "party";

/**
 * Play types: how people are physically arranged.
 */
export type PlayType = "online" | "local";

/**
 * Simple difficulty enum.
 */
export type Difficulty = "easy" | "medium" | "hard";

/**
 * Generic error shape for game logic.
 */
export interface GameError {
  code: string;
  message: string;
}

/**
 * Minimal shape of a room as used by the engine.
 * (Backend can adapt Convex documents to this shape.)
 */
export interface EngineRoom {
  id: string;        // Convex Id<"rooms"> serialized to string, or any stable id
  gameId: GameId;
  mode: GameMode;
  playType: PlayType;
}

/**
 * Minimal shape of a player as used by the engine.
 */
export interface EnginePlayer {
  id: string;              // Convex Id<"players"> serialized, or any stable id
  userId?: string | null;  // Clerk userId (optional for guests)
  displayName: string;
  role: "host" | "player" | "spectator";
  score: number;
  isConnected: boolean;
}

/**
 * Public state is what all clients are allowed to see.
 * Some games may want to “hide” secret info from non-hosts.
 */
export interface PublicGameState {
  // This is intentionally `any` here; each game can define
  // its own structured public state type and re-export.
  [key: string]: unknown;
}

/**
 * Internal state is the full engine state (may contain hidden info).
 */
export interface InternalGameState {
  // This is intentionally `any` here; each game can define
  // its own structured internal state type and re-export.
  [key: string]: unknown;
}

/**
 * Base action type. Each game usually defines a discriminated union
 * extending this, e.g.
 *
 * type MumbledAction =
 *   | { type: "SUBMIT_ANSWER"; answer: string }
 *   | { type: "SKIP" }
 *   | { type: "HOST_NEXT_ROUND" };
 */
export interface BaseAction {
  type: string;
  [key: string]: unknown;
}

/**
 * Context available to the engine during init/reduce.
 * The backend (Convex mutations) is responsible for constructing this.
 */
export interface EngineContext {
  room: EngineRoom;
  players: EnginePlayer[];
  now: number;
}

/**
 * Result of applying an action.
 * Allows the engine to update state, emit server-side events,
 * and request side effects (if you want to implement that later).
 */
export interface EngineResult<State = InternalGameState> {
  state: State;
  // Optional events; you can fan these out to clients if you want.
  events?: GameEvent[];
  // Optional high-level error (e.g. invalid action).
  error?: GameError;
}

/**
 * Generic event emitted by a game (optional feature).
 * You can use this to simplify client-side animation / toasts.
 */
export interface GameEvent {
  type: string;
  payload?: unknown;
}

//
// 2. Game definition & engine contracts
//

/**
 * High-level definition for a game.
 * This is mostly metadata + config for the UI / game list.
 */
export interface GameDefinition<Config = unknown> {
  id: GameId;
  name: string;
  description?: string;

  /**
   * Which modes does this game support?
   */
  supportedModes: GameMode[];

  /**
   * Which play types does this game support?
   * (Almost always ["online", "local"], but you can restrict if needed.)
   */
  supportedPlayTypes: PlayType[];

  /**
   * Default configuration for the game.
   * (e.g. default categories, difficulty filters, round count)
   */
  defaultConfig: Config;

  /**
   * Optional: categories available in this game.
   * (Can be used to build filters in the UI.)
   */
  categories?: {
    id: string;      // e.g. "common-phrases"
    label: string;   // e.g. "Common Phrases"
    description?: string;
    isDefault?: boolean;
  }[];

  /**
   * Optional: label/icon to show in the game picker list.
   */
  iconEmoji?: string;
}

/**
 * GameEngine is the core contract each game must implement.
 *
 * Config:
 *   The configuration object for this game (per-room).
 *
 * State:
 *   The internal engine state stored in Convex.
 *
 * Action:
 *   The discriminated union of all actions this game accepts.
 */
export interface GameEngine<
  Config = unknown,
  State extends InternalGameState = InternalGameState,
  Action extends BaseAction = BaseAction
> {
  /**
   * Initialize a new game state.
   * Called when a room is created or when the game is reset.
   */
  init(config: Config, ctx: EngineContext): State | Promise<State>;

  /**
   * Apply a player or host action to the current state.
   * This should be pure (no side effects except through the result).
   */
  reduce(
    state: State,
    action: Action,
    ctx: EngineContext
  ): State | EngineResult<State> | Promise<State | EngineResult<State>>;

  /**
   * Convert internal state to public state for clients.
   * You can hide secret info from non-hosts here.
   */
  toPublicState(
    state: State,
    ctx: EngineContext,
    viewer?: EnginePlayer | null
  ): PublicGameState;

  /**
   * Optional helper to determine if the round is over.
   * Useful for backend logic to route to "next round" automatically.
   */
  isRoundOver?(state: State, ctx: EngineContext): boolean;

  /**
   * Optional helper to determine if the game is fully finished.
   */
  isGameOver?(state: State, ctx: EngineContext): boolean;
}

/**
 * A fully registered game: definition + engine.
 */
export interface RegisteredGame<
  Config = unknown,
  State extends InternalGameState = InternalGameState,
  Action extends BaseAction = BaseAction
> {
  definition: GameDefinition<Config>;
  engine: GameEngine<Config, State, Action>;
}

//
// 3. Registry
//

/**
 * A simple in-memory registry. On the backend, you can build this
 * from per-game modules and import it in Convex mutations.
 *
 * Example:
 *
 * import { mumbledGame } from "@thinkinghat/mumbled-game";
 * import { rebusGame } from "@thinkinghat/rebus-game";
 * import { riddlesGame } from "@thinkinghat/riddles-game";
 *
 * export const games = createGameRegistry([mumbledGame, rebusGame, riddlesGame]);
 */
export interface GameRegistry {
  getAll(): RegisteredGame[];
  getById(id: GameId): RegisteredGame | undefined;
}

export function createGameRegistry(
  games: RegisteredGame[]
): GameRegistry {
  const byId = new Map<GameId, RegisteredGame>();
  for (const game of games) {
    if (byId.has(game.definition.id)) {
      throw new Error(`Duplicate game id registered: ${game.definition.id}`);
    }
    byId.set(game.definition.id, game);
  }

  return {
    getAll() {
      return Array.from(byId.values());
    },
    getById(id: GameId) {
      return byId.get(id);
    },
  };
}

//
// 4. Helper functions used by Convex + clients
//

/**
 * Initialize a game state for a room.
 *
 * This is what you’ll typically call inside a Convex mutation
 * when creating a room or resetting a game.
 */
export async function initGameState<
  Config,
  State extends InternalGameState,
  Action extends BaseAction
>(
  registeredGame: RegisteredGame<Config, State, Action>,
  config: Config,
  ctx: EngineContext
): Promise<State> {
  const maybeState = await registeredGame.engine.init(config, ctx);
  if (typeof maybeState === "object" && maybeState !== null && "state" in (maybeState as any)) {
    // In case someone accidentally returns EngineResult from init
    return (maybeState as unknown as EngineResult<State>).state;
  }
  return maybeState as State;
}

/**
 * Apply an action to the game state.
 *
 * Typically used inside a Convex mutation:
 * - load room, players, gameState from DB
 * - build EngineContext
 * - call applyGameAction(...)
 * - write back new state, handle events/error as needed
 */
export async function applyGameAction<
  Config,
  State extends InternalGameState,
  Action extends BaseAction
>(
  registeredGame: RegisteredGame<Config, State, Action>,
  state: State,
  action: Action,
  ctx: EngineContext
): Promise<EngineResult<State>> {
  const result = await registeredGame.engine.reduce(state, action, ctx);

  if ("state" in (result as EngineResult<State>)) {
    // Proper EngineResult
    return result as EngineResult<State>;
  }

  // Plain state returned, wrap it.
  return { state: result as State };
}

/**
 * Helper to produce public state for a given viewer.
 * Useful for Convex queries that prepare data for clients.
 */
export function getPublicGameState<
  Config,
  State extends InternalGameState,
  Action extends BaseAction
>(
  registeredGame: RegisteredGame<Config, State, Action>,
  state: State,
  ctx: EngineContext,
  viewer?: EnginePlayer | null
): PublicGameState {
  return registeredGame.engine.toPublicState(state, ctx, viewer ?? null);
}

//
// 5. Convenience types for game authors
//

/**
 * Utility to build a strongly-typed RegisteredGame.
 * (Nice DX when authoring game modules.)
 */
export function defineGame<
  Config,
  State extends InternalGameState,
  Action extends BaseAction
>(options: {
  definition: GameDefinition<Config>;
  engine: GameEngine<Config, State, Action>;
}): RegisteredGame<Config, State, Action> {
  return options;
}

/**
 * Common type helpers for game modules to re-use.
 */
export type AnyRegisteredGame = RegisteredGame<any, any, any>;
export type AnyGameEngine = GameEngine<any, any, any>;
export type AnyGameDefinition = GameDefinition<any>;
export type AnyAction = BaseAction;

//
// 6. Platform session helpers (room wrapper)
//

export * from "./session";
export * from "./turns";

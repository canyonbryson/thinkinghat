/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as game from "../game.js";
import type * as games from "../games.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_roomCode from "../lib/roomCode.js";
import type * as lib_session from "../lib/session.js";
import type * as mumbled from "../mumbled.js";
import type * as openai from "../openai.js";
import type * as players from "../players.js";
import type * as rooms from "../rooms.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  game: typeof game;
  games: typeof games;
  "lib/auth": typeof lib_auth;
  "lib/roomCode": typeof lib_roomCode;
  "lib/session": typeof lib_session;
  mumbled: typeof mumbled;
  openai: typeof openai;
  players: typeof players;
  rooms: typeof rooms;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

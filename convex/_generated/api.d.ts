/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as advisor from "../advisor.js";
import type * as ai from "../ai.js";
import type * as forecasts from "../forecasts.js";
import type * as gamification from "../gamification.js";
import type * as homes from "../homes.js";
import type * as maintenance from "../maintenance.js";
import type * as systemTypes from "../systemTypes.js";
import type * as systems from "../systems.js";
import type * as users from "../users.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  advisor: typeof advisor;
  ai: typeof ai;
  forecasts: typeof forecasts;
  gamification: typeof gamification;
  homes: typeof homes;
  maintenance: typeof maintenance;
  systemTypes: typeof systemTypes;
  systems: typeof systems;
  users: typeof users;
  weather: typeof weather;
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

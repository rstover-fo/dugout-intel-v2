/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  ActionBuilder,
  HttpActionBuilder,
  MutationBuilder,
  QueryBuilder,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 */
export declare const query: QueryBuilder<DataModel, "public">;

/**
 * Define a mutation in this Convex app's public API.
 */
export declare const mutation: MutationBuilder<DataModel, "public">;

/**
 * Define an action in this Convex app's public API.
 */
export declare const action: ActionBuilder<DataModel, "public">;

/**
 * Define an HTTP action.
 */
export declare const httpAction: HttpActionBuilder;

/**
 * An internal query.
 */
export declare const internalQuery: QueryBuilder<DataModel, "internal">;

/**
 * An internal mutation.
 */
export declare const internalMutation: MutationBuilder<DataModel, "internal">;

/**
 * An internal action.
 */
export declare const internalAction: ActionBuilder<DataModel, "internal">;

/**
 * A type representing the context of a query.
 */
export type QueryCtx = GenericQueryCtx<DataModel>;

/**
 * A type representing the context of a mutation.
 */
export type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * A type representing the context of an action.
 */
export type ActionCtx = GenericActionCtx<DataModel>;

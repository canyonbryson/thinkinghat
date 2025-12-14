import type { Auth } from "convex/server";

export async function requireUserId(ctx: { auth: Auth }): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) {
    throw new Error("Unauthorized");
  }
  return identity.subject;
}

export async function getUserIdentity(ctx: { auth: Auth }) {
  return await ctx.auth.getUserIdentity();
}

function coerceTruthyBoolean(value: unknown): boolean {
  if (value === true) return true;
  if (value === false) return false;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes";
  }
  if (typeof value === "number") return value === 1;
  return false;
}

function getIsAdminFromMaybeJson(value: unknown): unknown {
  // If public_metadata is embedded as a JSON string in the JWT, parse it.
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return (parsed as any)?.isAdmin;
    } catch {
      return undefined;
    }
  }
  if (value && typeof value === "object") {
    return (value as any)?.isAdmin;
  }
  return undefined;
}

/**
 * Detect admin flag from a Convex identity coming from Clerk auth.
 * Clerk can surface metadata either as `identity.publicMetadata` or inside JWT claims
 * under `claims.public_metadata`.
 */
export function isAdminIdentity(identity: any): boolean {
  console.log("identity", identity);
  if (identity?.email === "canyonbryson@gmail.com") {
    return true;
  }
  const claims = identity?.claims ?? identity?.customClaims ?? {};
  const isAdminFromPublicMetadata = getIsAdminFromMaybeJson(identity?.publicMetadata);
  const isAdminFromPublic_metadata = getIsAdminFromMaybeJson(identity?.public_metadata);
  const isAdminFromClaimsPublic_metadata = getIsAdminFromMaybeJson(claims?.public_metadata);

  const candidates: unknown[] = [
    isAdminFromPublicMetadata,
    isAdminFromPublic_metadata,
    claims?.isAdmin,
    claims?.publicMetadata?.isAdmin,
    isAdminFromClaimsPublic_metadata,
    (claims?.public_metadata as any)?.is_admin,
    // Convex may flatten nested JWT claims into dot-delimited keys
    identity?.["publicMetadata.isAdmin"],
    identity?.["public_metadata.isAdmin"],
    identity?.["public_metadata.is_admin"],
    identity?.["isAdmin"],
  ];

  return candidates.some(coerceTruthyBoolean);
}

/**
 * Require the current user to be an admin.
 * Checks Clerk metadata/claims first, then falls back to database role.
 * Throws if not authenticated or not an admin.
 */
export async function requireAdmin(ctx: { auth: Auth; db: any }): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) {
    throw new Error("Unauthorized");
  }

  // Check Clerk metadata/claims first
  if (isAdminIdentity(identity)) {
    return identity.subject;
  }

  // Fall back to database role check (for backwards compatibility)
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", identity.subject))
    .first();
  
  // Default to "user" role if not set
  if (!user || (user.role ?? "user") !== "admin") {
    throw new Error("Admin access required");
  }
  
  return identity.subject;
}

export type Actor =
  | { kind: "user"; userId: string }
  | { kind: "guest"; guestId: string };

/**
 * Get the current actor. If the request is authenticated via Clerk/Convex auth,
 * returns the Clerk user id. Otherwise, requires a guestId.
 */
export async function getActor(
  ctx: { auth: Auth },
  opts: { guestId?: string }
): Promise<Actor> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity?.subject) {
    return { kind: "user", userId: identity.subject };
  }
  if (opts.guestId) {
    return { kind: "guest", guestId: opts.guestId };
  }
  throw new Error("Unauthorized");
}



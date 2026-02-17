import { MutationCtx, QueryCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function logActivity(
  ctx: MutationCtx,
  data: {
    organizationId: Id<"organizations">;
    userId: Id<"users">;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: {
      email?: string;
      role?: string;
      oldRole?: string;
      newRole?: string;
      targetUserId?: string;
      targetUserEmail?: string;
    };
  }
) {
  await ctx.db.insert("activityLog", {
    ...data,
    timestamp: Date.now(),
  });
}

export async function requireOrgMembership(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">
) {
  const membership = await ctx.db
    .query("members")
    .withIndex("by_org_and_user", (q) =>
      q.eq("organizationId", organizationId).eq("userId", userId)
    )
    .first();

  if (!membership) {
    throw new Error("Not a member of this organization");
  }

  return membership;
}

export async function requireOrgAdmin(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">,
  userId: Id<"users">
) {
  const membership = await requireOrgMembership(ctx, organizationId, userId);

  if (!["owner", "admin"].includes(membership.role)) {
    throw new Error("Insufficient permissions");
  }

  return membership;
}

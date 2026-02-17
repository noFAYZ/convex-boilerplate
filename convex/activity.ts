import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { auth } from "./lib/auth";
import { Id } from "./_generated/dataModel";

// Helper function to log activity
export async function logActivity(
  ctx: MutationCtx,
  data: {
    organizationId: Id<"organizations">;
    userId: Id<"users">;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
  }
) {
  await ctx.db.insert("activityLog", {
    ...data,
    timestamp: Date.now(),
  });
}

// List activity log for an organization (alias for getOrganizationActivity)
export const list = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Check if user is a member of the organization
    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not authorized to view this organization's activity");
    }

    // Get activity logs
    const logs = await ctx.db
      .query("activityLog")
      .withIndex("by_organization_and_timestamp", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(args.limit || 50);

    // Enrich with user information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user: user
            ? { id: user._id, name: user.name, email: user.email }
            : null,
        };
      })
    );

    return enrichedLogs;
  },
});

// Get activity log for an organization
export const getOrganizationActivity = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Check if user is a member of the organization
    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId as any)
      )
      .first();

    if (!membership) {
      throw new Error("Not authorized to view this organization's activity");
    }

    // Get activity logs
    const logs = await ctx.db
      .query("activityLog")
      .withIndex("by_organization_and_timestamp", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(args.limit || 50);

    // Enrich with user information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.userId);
        return {
          ...log,
          user: user
            ? { id: user._id, name: user.name, email: user.email }
            : null,
        };
      })
    );

    return enrichedLogs;
  },
});

// Get recent activity (all organizations for current user)
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Get user's organizations
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .collect();

    const organizationIds = memberships.map((m) => m.organizationId);

    // Get recent activity from all user's organizations
    const allLogs = await Promise.all(
      organizationIds.map((orgId) =>
        ctx.db
          .query("activityLog")
          .withIndex("by_organization_and_timestamp", (q) =>
            q.eq("organizationId", orgId)
          )
          .order("desc")
          .take(args.limit || 20)
      )
    );

    // Flatten and sort by timestamp
    const logs = allLogs
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, args.limit || 20);

    // Enrich with user and organization information
    const enrichedLogs = await Promise.all(
      logs.map(async (log) => {
        const [user, organization] = await Promise.all([
          ctx.db.get(log.userId),
          ctx.db.get(log.organizationId),
        ]);
        return {
          ...log,
          user: user
            ? { id: user._id, name: user.name, email: user.email }
            : null,
          organization: organization
            ? { id: organization._id, name: organization.name }
            : null,
        };
      })
    );

    return enrichedLogs;
  },
});

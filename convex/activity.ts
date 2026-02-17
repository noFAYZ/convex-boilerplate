import { v } from "convex/values";
import { query } from "./_generated/server";
import { auth } from "./lib/auth";
import { requireOrgMembership } from "./lib/helpers";

export const list = query({
  args: {
    organizationId: v.id("organizations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);
    await requireOrgMembership(ctx, args.organizationId, userId);

    const logs = await ctx.db
      .query("activityLog")
      .withIndex("by_organization_and_timestamp", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .order("desc")
      .take(args.limit ?? 50);

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

export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const allLogs = await Promise.all(
      memberships.map((m) =>
        ctx.db
          .query("activityLog")
          .withIndex("by_organization_and_timestamp", (q) =>
            q.eq("organizationId", m.organizationId)
          )
          .order("desc")
          .take(args.limit ?? 20)
      )
    );

    const logs = allLogs
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, args.limit ?? 20);

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

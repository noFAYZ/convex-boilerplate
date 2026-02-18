import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./lib/auth";
import { logActivity } from "./lib/helpers";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const updates: { name?: string; image?: string } = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;

    await ctx.db.patch(userId, updates);

    // Log activity in all user's organizations
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const membership of memberships) {
      const action = args.image !== undefined && args.name !== undefined
        ? "profile_updated"
        : args.image !== undefined
        ? "avatar_updated"
        : "profile_updated";

      await logActivity(ctx, {
        organizationId: membership.organizationId,
        userId,
        action,
        entityType: "user",
        entityId: userId.toString(),
        metadata: {
          email: (await ctx.db.get(userId))?.email,
        },
      });
    }

    return await ctx.db.get(userId);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.requireUserId(ctx);

    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    for (const membership of memberships) {
      if (membership.role === "owner") {
        const otherOwners = await ctx.db
          .query("members")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", membership.organizationId)
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("role"), "owner"),
              q.neq(q.field("userId"), userId)
            )
          )
          .collect();

        if (otherOwners.length === 0) {
          throw new Error(
            "Cannot delete account while being the last owner of an organization. Transfer ownership or delete the organization first."
          );
        }
      }

      await ctx.db.delete(membership._id);
    }

    return { success: true };
  },
});

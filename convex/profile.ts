import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { auth } from "./lib/auth";

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId as any, updates);
    }

    return await ctx.db.get(userId as any);
  },
});

// Delete account
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.requireUserId(ctx);

    // Remove from all organizations
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .collect();

    for (const membership of memberships) {
      // Check if last owner
      if (membership.role === "owner") {
        const otherOwners = await ctx.db
          .query("members")
          .withIndex("by_organization", (q) =>
            q.eq("organizationId", membership.organizationId)
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("role"), "owner"),
              q.neq(q.field("userId"), userId as any)
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

    // Note: Convex Auth handles actual user deletion
    // This just removes the user from organizations
    return { success: true };
  },
});

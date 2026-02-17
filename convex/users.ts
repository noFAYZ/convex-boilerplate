import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./lib/auth";

// Get current authenticated user
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId as any);
    return user;
  },
});

// Get user by ID
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user profile
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.image !== undefined) updates.image = args.image;

    await ctx.db.patch(userId as any, updates);

    return await ctx.db.get(userId as any);
  },
});

// Search users by name (for inviting to organizations)
export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const results = await ctx.db
      .query("users")
      .withSearchIndex("search_name", (q) =>
        q.search("name", args.query)
      )
      .take(args.limit ?? 10);

    return results;
  },
});

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

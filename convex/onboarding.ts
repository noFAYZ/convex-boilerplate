import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./lib/auth";

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const membership = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      hasCompletedOnboarding: !!membership,
      userId,
    };
  },
});

export const completeProfile = mutation({
  args: {
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const updates: { name: string; image?: string } = { name: args.name };
    if (args.image) updates.image = args.image;

    await ctx.db.patch(userId, updates);
    return { success: true };
  },
});

export const complete = mutation({
  args: {
    organizationName: v.string(),
    organizationSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.organizationSlug))
      .first();

    if (existingOrg) {
      throw new Error("Organization slug is already taken");
    }

    const now = Date.now();

    const orgId = await ctx.db.insert("organizations", {
      name: args.organizationName,
      slug: args.organizationSlug,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("members", {
      organizationId: orgId,
      userId,
      role: "owner",
      joinedAt: now,
    });

    return {
      success: true,
      organizationId: orgId,
      organizationSlug: args.organizationSlug,
    };
  },
});

export const generateSlug = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    let slug = args.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (existingOrg) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${randomSuffix}`;
    }

    return { slug };
  },
});

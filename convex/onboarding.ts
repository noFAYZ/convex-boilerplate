import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./lib/auth";

// Check if user has completed onboarding
export const getOnboardingStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    // Check if user has an organization
    const membership = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .first();

    return {
      hasCompletedOnboarding: !!membership,
      userId,
    };
  },
});

// Complete user profile step
export const completeProfile = mutation({
  args: {
    name: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Update user profile
    await ctx.db.patch(userId as any, {
      name: args.name,
      ...(args.image && { image: args.image }),
    });

    return { success: true };
  },
});

// Create organization and complete onboarding
export const completeOnboarding = mutation({
  args: {
    organizationName: v.string(),
    organizationSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Check if slug is already taken
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.organizationSlug))
      .first();

    if (existingOrg) {
      throw new Error("Organization slug is already taken");
    }

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.organizationName,
      slug: args.organizationSlug,
      createdBy: userId as any,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add user as owner
    await ctx.db.insert("members", {
      organizationId: orgId,
      userId: userId as any,
      role: "owner",
      joinedAt: Date.now(),
    });

    return {
      success: true,
      organizationId: orgId,
      organizationSlug: args.organizationSlug,
    };
  },
});

// Generate slug from organization name
export const generateSlug = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert to lowercase, replace spaces with hyphens, remove special chars
    let slug = args.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists
    const existingOrg = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    // If exists, add a random suffix
    if (existingOrg) {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${randomSuffix}`;
    }

    return { slug };
  },
});

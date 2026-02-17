import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./lib/auth";

// Get all organizations for current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Get all memberships for user
    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId as any))
      .collect();

    // Fetch organization details
    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return org ? { ...org, role: membership.role } : null;
      })
    );

    return organizations.filter((org) => org !== null);
  },
});

// Get organization by ID
export const getById = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Check membership
    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("userId", userId as any)
      )
      .first();

    if (!membership) throw new Error("Not a member of this organization");

    const org = await ctx.db.get(args.organizationId);
    return org ? { ...org, role: membership.role } : null;
  },
});

// Get organization by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!org) return null;

    // Check membership
    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q.eq("organizationId", org._id).eq("userId", userId as any)
      )
      .first();

    if (!membership) throw new Error("Not a member of this organization");

    return { ...org, role: membership.role };
  },
});

// Create new organization
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new Error(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    }

    // Check if slug is already taken
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) throw new Error("Organization slug already taken");

    const now = Date.now();

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      logo: args.logo,
      createdBy: userId as any,
      createdAt: now,
      updatedAt: now,
    });

    // Add creator as owner
    await ctx.db.insert("members", {
      organizationId,
      userId: userId as any,
      role: "owner",
      joinedAt: now,
    });

    return organizationId;
  },
});

// Update organization
export const update = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Check if user is admin or owner
    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("userId", userId as any)
      )
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Insufficient permissions");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.logo !== undefined) updates.logo = args.logo;

    await ctx.db.patch(args.organizationId, updates);

    return await ctx.db.get(args.organizationId);
  },
});

// Delete organization
export const remove = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    // Only owner can delete
    const membership = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("userId", userId as any)
      )
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only owner can delete organization");
    }

    // Delete all members
    const members = await ctx.db
      .query("members")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete all invitations
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }

    // Delete organization
    await ctx.db.delete(args.organizationId);
  },
});

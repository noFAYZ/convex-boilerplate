import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./lib/auth";
import { requireOrgMembership, requireOrgAdmin } from "./lib/helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return org ? { ...org, role: membership.role } : null;
      })
    );

    return organizations.filter(Boolean);
  },
});

export const getById = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);
    const membership = await requireOrgMembership(ctx, args.organizationId, userId);
    const org = await ctx.db.get(args.organizationId);
    return org ? { ...org, role: membership.role } : null;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!org) return null;

    const membership = await requireOrgMembership(ctx, org._id, userId);
    return { ...org, role: membership.role };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    if (!/^[a-z0-9-]+$/.test(args.slug)) {
      throw new Error(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
    }

    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) throw new Error("Organization slug already taken");

    const now = Date.now();

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      logo: args.logo,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("members", {
      organizationId,
      userId,
      role: "owner",
      joinedAt: now,
    });

    return organizationId;
  },
});

export const update = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);
    await requireOrgAdmin(ctx, args.organizationId, userId);

    const updates: { updatedAt: number; name?: string; logo?: string } = {
      updatedAt: Date.now(),
    };
    if (args.name !== undefined) updates.name = args.name;
    if (args.logo !== undefined) updates.logo = args.logo;

    await ctx.db.patch(args.organizationId, updates);
    return await ctx.db.get(args.organizationId);
  },
});

export const remove = mutation({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const membership = await requireOrgMembership(ctx, args.organizationId, userId);
    if (membership.role !== "owner") {
      throw new Error("Only owner can delete organization");
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }

    await ctx.db.delete(args.organizationId);
  },
});

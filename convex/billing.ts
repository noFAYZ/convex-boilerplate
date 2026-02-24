import { v } from "convex/values";
import { query, internalMutation, internalQuery } from "./_generated/server";
import { auth } from "./lib/auth";
import { Id } from "./_generated/dataModel";

export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);

    if (!userId) {
      return null;
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return subscription || null;
  },
});

export const getSubscriptionInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return subscription || null;
  },
});

export const getSubscriptionByPolarId = query({
  args: { polarSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription_id", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId)
      )
      .first();
  },
});

export const upsertSubscription = internalMutation({
  args: {
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("incomplete")
    ),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        polarSubscriptionId: args.polarSubscriptionId,
        polarCustomerId: args.polarCustomerId,
        plan: args.plan,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        updatedAt: now,
      });
      return existing._id;
    } else {
      const newId = await ctx.db.insert("subscriptions", {
        userId: args.userId,
        polarSubscriptionId: args.polarSubscriptionId,
        polarCustomerId: args.polarCustomerId,
        plan: args.plan,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
        createdAt: now,
        updatedAt: now,
      });
      return newId;
    }
  },
});

export const removeSubscription = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
  },
});

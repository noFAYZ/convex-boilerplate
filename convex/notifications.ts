import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { auth } from "./lib/auth";

type NotificationType = "member_invited" | "member_joined" | "role_changed" | "member_removed";

/**
 * List notifications for the current user
 * Enriches with actor name
 */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    const userId = await auth.requireUserId(ctx);

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .order("desc")
      .take(limit);

    // Enrich with actor name
    return Promise.all(
      notifications.map(async (n) => ({
        ...n,
        actor: n.actorId ? await ctx.db.get(n.actorId) : null,
      }))
    );
  },
});

/**
 * Get unread notification count
 */
export const getUnreadCount = query({
  handler: async (ctx) => {
    const userId = await auth.requireUserId(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", userId as Id<"users">).eq("read", false)
      )
      .collect();

    return unread.length;
  },
});

/**
 * Mark a single notification as read
 */
export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
    return { success: true };
  },
});

/**
 * Mark all notifications as read for current user
 */
export const markAllRead = mutation({
  handler: async (ctx) => {
    const userId = await auth.requireUserId(ctx);

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", userId as Id<"users">).eq("read", false)
      )
      .collect();

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return { success: true, count: unreadNotifications.length };
  },
});

/**
 * Internal mutation to create notifications
 * Called from other mutation handlers
 */
export const create = internalMutation({
  args: {
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    type: v.union(
      v.literal("member_invited"),
      v.literal("member_joined"),
      v.literal("role_changed"),
      v.literal("member_removed")
    ),
    title: v.string(),
    message: v.string(),
    actorId: v.optional(v.id("users")),
  },
  handler: async (ctx, { userId, organizationId, type, title, message, actorId }) => {
    await ctx.db.insert("notifications", {
      userId,
      organizationId,
      type,
      title,
      message,
      read: false,
      createdAt: Date.now(),
      actorId,
    });
  },
});

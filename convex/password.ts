import { v } from "convex/values";
import { mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./lib/auth";

export const changePassword = action({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    if (args.newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters");
    }

    const authData = await ctx.runQuery(internal.password.getAuthData, {
      userId,
    });

    if (!authData?.user || !authData?.authAccount) {
      throw new Error("User or authentication data not found");
    }

    try {
      const crypto = await import("crypto");
      const hashedPassword = crypto
        .createHash("sha256")
        .update(args.newPassword + (authData.user.email ?? ""))
        .digest("hex");

      await ctx.runMutation(internal.password.updatePasswordHash, {
        authAccountId: authData.authAccount._id,
        newPasswordHash: hashedPassword,
      });

      return { success: true };
    } catch {
      throw new Error("Failed to change password");
    }
  },
});

export const getAuthData = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    const authAccount = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", args.userId).eq("provider", "password")
      )
      .first();

    return { user, authAccount };
  },
});

export const updatePasswordHash = internalMutation({
  args: {
    authAccountId: v.id("authAccounts"),
    newPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.authAccountId, {
      secret: args.newPasswordHash,
    });
    return { success: true };
  },
});

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return { success: true };
    }

    // TODO: Implement password reset token storage and email sending
    return { success: true };
  },
});

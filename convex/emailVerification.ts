import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { logActivity } from "./lib/helpers";

// Generate a random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 10 minutes in milliseconds
const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000;

/**
 * Request email verification by generating and sending a code
 */
export const requestVerification = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Generate code
    const code = generateCode();
    const expiresAt = Date.now() + VERIFICATION_CODE_EXPIRY;

    // Delete any existing verification codes for this user
    const existing = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    // Insert new verification code
    await ctx.db.insert("emailVerifications", {
      userId: user._id,
      code,
      expiresAt,
      createdAt: Date.now(),
    });

    // Send email synchronously to ensure it completes
    const emailResult = await ctx.runAction(internal.actions.email.sendVerificationEmail, {
      email,
      code,
      userName: user.name || "User",
    });

    if (!emailResult.success) {
      throw new Error(`Failed to send verification email: ${emailResult.reason}`);
    }

    return { success: true };
  },
});

/**
 * Verify email with code and set emailVerificationTime
 */
export const verifyEmail = mutation({
  args: { email: v.string(), code: v.string() },
  handler: async (ctx, { email, code }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Find verification code
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!verification) {
      throw new Error("No verification code found. Please request a new one.");
    }

    // Check expiry
    if (verification.expiresAt < Date.now()) {
      await ctx.db.delete(verification._id);
      throw new Error("Verification code has expired");
    }

    // Check code matches
    if (verification.code !== code) {
      throw new Error("Invalid verification code");
    }

    // Mark email as verified
    await ctx.db.patch(user._id, {
      emailVerificationTime: Date.now(),
    });

    // Delete verification code
    await ctx.db.delete(verification._id);

    return { success: true };
  },
});

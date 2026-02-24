"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

/**
 * Send email verification code via Resend
 * Requires RESEND_API_KEY environment variable
 */
export const sendVerificationEmail = action({
  args: {
    email: v.string(),
    code: v.string(),
    userName: v.string(),
  },
  handler: async (ctx, { email, code, userName }) => {
    try {
      // Validate API key
      if (!process.env.RESEND_API_KEY) {
        console.warn(
          "[Email] RESEND_API_KEY not set. Verification email not sent. Code:",
          code
        );
        return { success: false, reason: "RESEND_API_KEY not configured" };
      }

      // Import Resend only when function runs
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@convex-boilerplate.com",
        to: email,
        subject: "Verify your email address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Hi ${userName},</p>
            <p>Please verify your email address by entering this code:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">${code}</span>
            </div>
            <p>This code expires in 10 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Convex Boilerplate</p>
          </div>
        `,
      });

      if (result.error) {
        console.error("[Email] Resend error:", result.error);
        return { success: false, reason: result.error.message };
      }

      console.log("[Email] Verification email sent to", email, "ID:", result.data?.id);
      return { success: true };
    } catch (error) {
      console.error("[Email] Unexpected error:", error);
      return {
        success: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "../_generated/server";

// Auth helpers following @convex-dev/auth best practices
export const auth = {
  // Get the authenticated user ID (returns null if not authenticated)
  getUserId: getAuthUserId,

  // Require authenticated user (throws if not authenticated)
  requireUserId: async (ctx: QueryCtx | MutationCtx): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }
    return userId;
  },
};

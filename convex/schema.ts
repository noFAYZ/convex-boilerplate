import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const roleValidator = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member")
);

export const inviteRoleValidator = v.union(
  v.literal("admin"),
  v.literal("member")
);

export const invitationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("expired")
);

export const activityMetadataValidator = v.optional(
  v.object({
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    oldRole: v.optional(v.string()),
    newRole: v.optional(v.string()),
    targetUserId: v.optional(v.string()),
    targetUserEmail: v.optional(v.string()),
  })
);

const schema = defineSchema({
  ...authTables,

  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    logo: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_createdBy", ["createdBy"])
    .searchIndex("search_name", { searchField: "name" }),

  members: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: roleValidator,
    invitedBy: v.optional(v.id("users")),
    joinedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_org_and_user", ["organizationId", "userId"]),

  invitations: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: inviteRoleValidator,
    invitedBy: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    status: invitationStatusValidator,
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  activityLog: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    action: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    metadata: activityMetadataValidator,
    timestamp: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_organization_and_timestamp", ["organizationId", "timestamp"]),
});

export default schema;

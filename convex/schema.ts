import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Convex Auth handles authentication tables automatically
// We extend it with our organization/multi-tenant tables
const schema = defineSchema({
  ...authTables,

  // Organizations table
  organizations: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly identifier
    logo: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    metadata: v.optional(v.any()), // Additional organization data
  })
    .index("by_slug", ["slug"])
    .index("by_createdBy", ["createdBy"])
    .searchIndex("search_name", {
      searchField: "name",
    }),

  // Organization members table
  members: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    invitedBy: v.optional(v.id("users")),
    joinedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_org_and_user", ["organizationId", "userId"]),

  // Invitations table
  invitations: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    invitedBy: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired")
    ),
    createdAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  // Activity log for audit trail
  activityLog: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    action: v.string(), // e.g., "member.invited", "settings.updated", "member.removed"
    entityType: v.optional(v.string()), // e.g., "member", "organization", "settings"
    entityId: v.optional(v.string()), // ID of the affected entity
    metadata: v.optional(v.any()), // Additional context (e.g., old/new values)
    timestamp: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_organization_and_timestamp", ["organizationId", "timestamp"]),
});

export default schema;

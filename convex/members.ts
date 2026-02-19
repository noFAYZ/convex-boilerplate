import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./lib/auth";
import { inviteRoleValidator, roleValidator } from "./schema";
import {
  logActivity,
  requireOrgMembership,
  requireOrgAdmin,
} from "./lib/helpers";

export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);
    await requireOrgMembership(ctx, args.organizationId, userId);

    const members = await ctx.db
      .query("members")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();

    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return { ...member, user };
      })
    );

    return membersWithUsers;
  },
});

export const invite = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.string(),
    role: inviteRoleValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);
    await requireOrgAdmin(ctx, args.organizationId, userId);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      const existingMember = await ctx.db
        .query("members")
        .withIndex("by_org_and_user", (q) =>
          q
            .eq("organizationId", args.organizationId)
            .eq("userId", existingUser._id)
        )
        .first();

      if (existingMember) {
        throw new Error("User is already a member");
      }
    }

    const existingInvite = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) =>
        q.and(
          q.eq(q.field("organizationId"), args.organizationId),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingInvite) throw new Error("User already invited");

    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const invitationId = await ctx.db.insert("invitations", {
      organizationId: args.organizationId,
      email: args.email,
      role: args.role,
      invitedBy: userId,
      token,
      expiresAt,
      status: "pending",
      createdAt: Date.now(),
    });

    await logActivity(ctx, {
      organizationId: args.organizationId,
      userId,
      action: "member.invited",
      entityType: "invitation",
      entityId: invitationId,
      metadata: { email: args.email, role: args.role },
    });

    return { invitationId, token };
  },
});

export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) throw new Error("Invitation not found");

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Invitation has expired");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.email !== invitation.email) {
      throw new Error("Invitation is for a different email address");
    }

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_org_and_user", (q) =>
        q
          .eq("organizationId", invitation.organizationId)
          .eq("userId", userId)
      )
      .first();

    if (existingMember) {
      await ctx.db.patch(invitation._id, { status: "accepted" });
      throw new Error("Already a member of this organization");
    }

    await ctx.db.insert("members", {
      organizationId: invitation.organizationId,
      userId,
      role: invitation.role,
      invitedBy: invitation.invitedBy,
      joinedAt: Date.now(),
    });

    await ctx.db.patch(invitation._id, { status: "accepted" });

    await logActivity(ctx, {
      organizationId: invitation.organizationId,
      userId,
      action: "member.joined",
      entityType: "member",
      entityId: user._id,
      metadata: { role: invitation.role },
    });

    return { organizationId: invitation.organizationId };
  },
});

export const updateRole = mutation({
  args: {
    memberId: v.id("members"),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    const userMembership = await requireOrgMembership(
      ctx,
      member.organizationId,
      userId
    );

    if (userMembership.role !== "owner") {
      throw new Error("Only owner can change roles");
    }

    if (member.userId === userId) {
      throw new Error("Cannot change your own role");
    }

    const oldRole = member.role;
    await ctx.db.patch(args.memberId, { role: args.role });

    await logActivity(ctx, {
      organizationId: member.organizationId,
      userId,
      action: "member.role_updated",
      entityType: "member",
      entityId: args.memberId,
      metadata: {
        oldRole,
        newRole: args.role,
        targetUserId: member.userId,
      },
    });

    return await ctx.db.get(args.memberId);
  },
});

export const remove = mutation({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const member = await ctx.db.get(args.memberId);
    if (!member) throw new Error("Member not found");

    const userMembership = await requireOrgMembership(
      ctx,
      member.organizationId,
      userId
    );

    const canRemove =
      ["owner", "admin"].includes(userMembership.role) ||
      member.userId === userId;

    if (!canRemove) throw new Error("Insufficient permissions");

    if (member.role === "owner") {
      const owners = await ctx.db
        .query("members")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", member.organizationId)
        )
        .filter((q) => q.eq(q.field("role"), "owner"))
        .collect();

      if (owners.length === 1) {
        throw new Error("Cannot remove last owner");
      }
    }

    const targetUser = await ctx.db.get(member.userId);
    await ctx.db.delete(args.memberId);

    await logActivity(ctx, {
      organizationId: member.organizationId,
      userId,
      action: member.userId === userId ? "member.left" : "member.removed",
      entityType: "member",
      entityId: args.memberId,
      metadata: {
        targetUserId: member.userId,
        targetUserEmail: targetUser?.email,
        role: member.role,
      },
    });
  },
});

export const listInvitations = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);
    await requireOrgAdmin(ctx, args.organizationId, userId);

    return await ctx.db
      .query("invitations")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

export const deleteInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const userId = await auth.requireUserId(ctx);

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitation not found");

    await requireOrgAdmin(ctx, invitation.organizationId, userId);

    await ctx.db.delete(args.invitationId);

    await logActivity(ctx, {
      organizationId: invitation.organizationId,
      userId,
      action: "invitation.revoked",
      entityType: "invitation",
      entityId: args.invitationId,
      metadata: { email: invitation.email },
    });
  },
});

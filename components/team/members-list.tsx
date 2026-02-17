"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

interface Member {
  _id: Id<"members">;
  userId: Id<"users">;
  role: "owner" | "admin" | "member";
  joinedAt: number;
  user: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    image?: string;
  } | null;
}

interface MembersListProps {
  members: Member[];
  currentUserRole: "owner" | "admin" | "member";
  currentUserId: Id<"users">;
  onUpdate?: () => void;
}

export function MembersList({
  members,
  currentUserRole,
  currentUserId,
  onUpdate,
}: MembersListProps) {
  const [loadingMemberId, setLoadingMemberId] = useState<Id<"members"> | null>(
    null
  );

  const updateRole = useMutation(api.members.updateRole);
  const removeMember = useMutation(api.members.remove);

  const handleRoleChange = async (
    memberId: Id<"members">,
    newRole: "owner" | "admin" | "member"
  ) => {
    setLoadingMemberId(memberId);
    try {
      await updateRole({ memberId, role: newRole });
      onUpdate?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleRemove = async (memberId: Id<"members">, userName?: string) => {
    const confirmed = confirm(
      `Are you sure you want to remove ${userName || "this member"}?`
    );
    if (!confirmed) return;

    setLoadingMemberId(memberId);
    try {
      await removeMember({ memberId });
      onUpdate?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setLoadingMemberId(null);
    }
  };

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCurrentUser = member.userId === currentUserId;
        const isLoading = loadingMemberId === member._id;

        return (
          <div
            key={member._id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {member.user?.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name || ""}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-medium">
                    {member.user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>

              {/* Info */}
              <div>
                <p className="font-medium">
                  {member.user?.name || "Unknown"}
                  {isCurrentUser && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (You)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Badge/Selector */}
              {currentUserRole === "owner" && !isCurrentUser ? (
                <select
                  value={member.role}
                  onChange={(e) =>
                    handleRoleChange(
                      member._id,
                      e.target.value as "owner" | "admin" | "member"
                    )
                  }
                  disabled={isLoading}
                  className="px-3 py-1 border rounded-md text-sm bg-background"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              ) : (
                <span className="px-3 py-1 bg-muted rounded-md text-sm capitalize">
                  {member.role}
                </span>
              )}

              {/* Remove Button */}
              {(canManage || isCurrentUser) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(member._id, member.user?.name)}
                  disabled={isLoading}
                >
                  {isCurrentUser ? "Leave" : "Remove"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

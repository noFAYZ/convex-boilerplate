"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { normalizeImageUrl } from "@/lib/normalize-image-url";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

interface MemberListProps {
  organizationId: Id<"organizations">;
}

function getInitials(name?: string): string {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

interface MemberRowProps {
  member: Awaited<ReturnType<typeof api.members.list>>[number];
  onRoleChange: (role: "owner" | "admin" | "member") => Promise<void>;
  onRemove: () => Promise<void>;
  isLoading?: boolean;
}

const MemberRow = React.memo(function MemberRow({
  member,
  onRoleChange,
  onRemove,
  isLoading,
}: MemberRowProps) {
  const handleRoleChange = useCallback(
    async (role: string) => {
      try {
        await onRoleChange(role as "owner" | "admin" | "member");
      } catch (error) {
        handleMutationError(error);
      }
    },
    [onRoleChange]
  );

  const handleRemove = useCallback(async () => {
    try {
      await onRemove();
    } catch (error) {
      handleMutationError(error);
    }
  }, [onRemove]);

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {member.user?.image ? (
            <img
              src={normalizeImageUrl(member.user.image) || ""}
              alt={member.user.name}
              className="size-8 rounded-full"
            />
          ) : (
            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
              {getInitials(member.user?.name)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold truncate">
            {member.user?.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {member.user?.email}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <Select value={member.role} onValueChange={handleRoleChange} disabled={isLoading}>
          <SelectTrigger size="sm"  >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          disabled={isLoading}
        >
          Remove
        </Button>
      </div>
    </div>
  );
});

MemberRow.displayName = "MemberRow";

export function MemberList({ organizationId }: MemberListProps) {
  const members = useQuery(api.members.list, { organizationId });
  const updateRole = useMutation(api.members.updateRole);
  const removeMember = useMutation(api.members.remove);

  const handleRoleChange = useCallback(
    (memberId: Id<"members">) =>
      async (role: "owner" | "admin" | "member") => {
        try {
          await updateRole({
            memberId,
            role,
          });
          handleMutationSuccess("Role updated successfully");
        } catch (error) {
          handleMutationError(error);
        }
      },
    [updateRole]
  );

  const handleRemoveMember = useCallback(
    (memberId: Id<"members">) =>
      async () => {
        try {
          await removeMember({ memberId });
          handleMutationSuccess("Member removed successfully");
        } catch (error) {
          handleMutationError(error);
        }
      },
    [removeMember]
  );

  if (!members) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No members yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <MemberRow
          key={member._id}
          member={member}
          onRoleChange={handleRoleChange(member._id)}
          onRemove={handleRemoveMember(member._id)}
        />
      ))}
    </div>
  );
}

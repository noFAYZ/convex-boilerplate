"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Trash } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { useCallback, useState } from "react";

interface InvitationListProps {
  invitations: Array<{
    _id: Id<"invitations">;
    email: string;
    role: string;
    createdAt: number;
    expiresAt: number;
  }>;
  organizationId: Id<"organizations">;
  onInvitationRemoved?: () => void;
}

export function InvitationList({
  invitations,
  organizationId,
  onInvitationRemoved,
}: InvitationListProps) {
  const [deletingId, setDeletingId] = useState<Id<"invitations"> | null>(null);
  const deleteInvitation = useMutation(api.members.deleteInvitation);

  const handleDelete = useCallback(
    async (invitationId: Id<"invitations">) => {
      setDeletingId(invitationId);
      try {
        await deleteInvitation({ invitationId });
        handleMutationSuccess("Invitation revoked");
        onInvitationRemoved?.();
      } catch (err) {
        handleMutationError(err);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteInvitation, onInvitationRemoved]
  );

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No pending invitations</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invitations.map((invitation) => (
        <div
          key={invitation._id}
          className="flex items-center justify-between p-2 rounded-lg   hover:bg-background"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{invitation.email}</div>
            <div className="text-xs text-muted-foreground">
              Expires {new Date(invitation.expiresAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[0.625rem]">
              {invitation.role}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(invitation._id)}
              disabled={deletingId === invitation._id}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <HugeiconsIcon icon={Trash} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

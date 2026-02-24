"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

interface RemoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: Id<"members">;
  memberName?: string;
  onSuccess?: () => void;
}

export function RemoveDialog({
  open,
  onOpenChange,
  memberId,
  memberName = "this member",
  onSuccess,
}: RemoveDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const removeMember = useMutation(api.members.remove);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await removeMember({ memberId });
      handleMutationSuccess("Member removed successfully");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      handleMutationError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {memberName}? They will no longer have access to this organization.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

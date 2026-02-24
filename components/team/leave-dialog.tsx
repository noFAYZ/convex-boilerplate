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

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: Id<"members">;
  memberName?: string;
  onSuccess?: () => void;
}

export function LeaveDialog({
  open,
  onOpenChange,
  memberId,
  memberName = "this member",
  onSuccess,
}: LeaveDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const removeMember = useMutation(api.members.remove);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await removeMember({ memberId });
      handleMutationSuccess("Left successfully");
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
          <DialogTitle>Leave?</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave? You will no longer have access to this organization and its data.
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
            {isLoading ? "Leaving..." : "Leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

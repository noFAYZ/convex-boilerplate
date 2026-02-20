"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Trash } from "@hugeicons/core-free-icons";

interface DeleteOrgDialogProps {
  orgId: Id<"organizations">;
  orgName: string;
  onDeleted?: () => void;
}

export function DeleteOrgDialog({
  orgId,
  orgName,
  onDeleted,
}: DeleteOrgDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const removeOrg = useMutation(api.organizations.remove);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await removeOrg({ organizationId: orgId });
      handleMutationSuccess("Organization deleted successfully");
      setOpen(false);
      onDeleted?.();
    } catch (err) {
      handleMutationError(err);
    } finally {
      setLoading(false);
    }
  }, [orgId, removeOrg, onDeleted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger variant="delete" size="sm">
        <HugeiconsIcon icon={Trash} className="h-3.5 w-3.5" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete Organization
          </DialogTitle>
          <DialogDescription>
            Permanently delete{" "}
            <span className="font-semibold text-foreground">
              "{orgName}"
            </span>{" "}
            and all associated data. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose disabled={loading}>Cancel</DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            size="sm"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

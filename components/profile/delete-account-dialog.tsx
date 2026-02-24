"use client";

import { useCallback, useState } from "react";
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Trash } from "@hugeicons/core-free-icons";

interface DeleteAccountDialogProps {
  onDeleted?: () => void;
}

export function DeleteAccountDialog({ onDeleted }: DeleteAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteAccount = useMutation(api.users.deleteAccount);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await deleteAccount({});
      handleMutationSuccess("Account deleted successfully");
      setOpen(false);
      onDeleted?.();
    } catch (err) {
      handleMutationError(err);
    } finally {
      setLoading(false);
    }
  }, [deleteAccount, onDeleted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="delete" size="sm">
          <HugeiconsIcon icon={Trash} className="h-3.5 w-3.5 mr-2" />
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete Account
          </DialogTitle>
          <DialogDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
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

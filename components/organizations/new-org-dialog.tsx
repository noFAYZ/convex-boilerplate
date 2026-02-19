"use client";

import { useCallback, useState, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus, ImageAddIcon } from "@hugeicons/core-free-icons";

interface NewOrgDialogProps {
  onSuccess?: () => void;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export function NewOrgDialog({ onSuccess }: NewOrgDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createOrg = useMutation(api.organizations.create);
  const slug = generateSlug(name);

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setLogo(result);
          setLogoPreview(result);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleRemoveLogo = useCallback(() => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleCreate = useCallback(async () => {
    setLoading(true);
    try {
      await createOrg({ name, slug, logo: logo || undefined });
      handleMutationSuccess("Organization created successfully");
      setOpen(false);
      setName("");
      setLogo(null);
      setLogoPreview(null);
      onSuccess?.();
    } catch (err) {
      handleMutationError(err);
    } finally {
      setLoading(false);
    }
  }, [name, slug, logo, createOrg, onSuccess]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setName("");
        setLogo(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger size="sm">
        <HugeiconsIcon icon={Plus} className="h-5 w-5" />
        Add
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to manage your workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-xs">
              Organization Name
            </Label>
            <Input
              id="org-name"
              placeholder="Acme Inc"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              autoFocus
            />
            {name && (
              <p className="text-[0.625rem] text-muted-foreground">
                URL slug: /{slug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-logo" className="text-xs">
              Organization Logo (Optional)
            </Label>
            <input
              ref={fileInputRef}
              id="org-logo"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={loading}
              className="hidden"
            />
            {logoPreview ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">Logo uploaded</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  disabled={loading}
                  className="text-xs"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-border hover:bg-muted/50 transition-colors"
              >
                <HugeiconsIcon icon={ImageAddIcon} className="h-4 w-4" />
                <span className="text-xs">Click to upload logo</span>
              </button>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose disabled={loading}>Cancel</DialogClose>
          <Button
            disabled={loading || !name}
            onClick={handleCreate}
            size="sm"
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

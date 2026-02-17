"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/upload/file-upload";

export default function ProfileSettingsPage() {
  const currentUser = useQuery(api.users.getCurrent);
  const updateProfile = useMutation(api.profile.updateProfile);
  const deleteAccount = useMutation(api.profile.deleteAccount);

  const [name, setName] = useState(currentUser?.name || "");
  const [image, setImage] = useState(currentUser?.image || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Update form when user data loads
  if (currentUser && !name && currentUser.name) {
    setName(currentUser.name);
  }
  if (currentUser && !image && currentUser.image) {
    setImage(currentUser.image);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSaved(false);

    try {
      await updateProfile({ name, image });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    const doubleCheck = prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    if (doubleCheck !== "DELETE") return;

    try {
      await deleteAccount({});
      // User will be logged out automatically
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete account");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Form */}
        <div className="border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <FileUpload
                type="avatar"
                currentImage={image}
                onUploadComplete={(url) => setImage(url)}
                label="Change Avatar"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              {isSaved && (
                <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  ✓ Saved
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="border border-destructive/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

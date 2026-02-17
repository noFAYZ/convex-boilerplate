"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileStepProps {
  onNext: (data: { name: string; image?: string }) => void;
  onBack: () => void;
  initialName?: string;
  isLoading?: boolean;
}

export function ProfileStep({
  onNext,
  onBack,
  initialName = "",
  isLoading = false,
}: ProfileStepProps) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNext({ name: name.trim(), image: image || undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself to personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Profile Image URL (optional)</Label>
          <Input
            id="image"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            You can upload a profile picture later
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" disabled={!name.trim() || isLoading} className="flex-1">
            {isLoading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}

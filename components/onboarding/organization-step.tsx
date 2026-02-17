"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface OrganizationStepProps {
  onNext: (data: { organizationName: string; organizationSlug: string }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function OrganizationStep({
  onNext,
  onBack,
  isLoading = false,
}: OrganizationStepProps) {
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const generateSlug = useMutation(api.onboarding.generateSlug);

  // Auto-generate slug from organization name if user hasn't manually edited it
  useEffect(() => {
    if (!slugTouched && organizationName) {
      const autoSlug = organizationName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setOrganizationSlug(autoSlug);
    }
  }, [organizationName, slugTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (organizationName.trim() && organizationSlug.trim()) {
      onNext({
        organizationName: organizationName.trim(),
        organizationSlug: organizationSlug.trim(),
      });
    }
  };

  const handleGenerateSlug = async () => {
    if (organizationName.trim()) {
      try {
        const result = await generateSlug({ name: organizationName });
        setOrganizationSlug(result.slug);
        setSlugTouched(true);
      } catch (error) {
        console.error("Failed to generate slug:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Create Your Organization</h2>
        <p className="text-muted-foreground">
          Set up your workspace where you'll collaborate with your team
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name *</Label>
          <Input
            id="organizationName"
            type="text"
            placeholder="Acme Inc."
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            required
            disabled={isLoading}
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationSlug">Organization URL *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground px-3 py-2 bg-muted border border-r-0 rounded-l-md">
                  app.com/
                </span>
                <Input
                  id="organizationSlug"
                  type="text"
                  placeholder="acme-inc"
                  value={organizationSlug}
                  onChange={(e) => {
                    setOrganizationSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  required
                  disabled={isLoading}
                  className="rounded-l-none"
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateSlug}
              disabled={!organizationName.trim() || isLoading}
            >
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This will be your organization's unique URL identifier
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
          <Button
            type="submit"
            disabled={
              !organizationName.trim() || !organizationSlug.trim() || isLoading
            }
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Create Organization"}
          </Button>
        </div>
      </form>
    </div>
  );
}

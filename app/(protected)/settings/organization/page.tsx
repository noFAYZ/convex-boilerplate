"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MemberList } from "@/components/organizations/member-list";
import { InviteMemberDialog } from "@/components/organizations/invite-member-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrganizationSettingsPage() {
  const organizations = useQuery(api.organizations.list);
  const createOrg = useMutation(api.organizations.create);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const activeOrg = organizations?.[0]; // For demo, use first org

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);

    try {
      await createOrg({ name: orgName, slug: orgSlug });
      setShowCreateForm(false);
      setOrgName("");
      setOrgSlug("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  if (!organizations) {
    return <div>Loading...</div>;
  }

  if (!activeOrg || organizations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Create Your First Organization</h1>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Create an organization to collaborate with your team
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Inc"
                  required
                  disabled={creating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={orgSlug}
                  onChange={(e) =>
                    setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="acme-inc"
                  required
                  disabled={creating}
                />
                <p className="text-xs text-muted-foreground">
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>

              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Organization"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">{activeOrg.name}</p>
        </div>
        <InviteMemberDialog organizationId={activeOrg._id} />
      </div>

      <MemberList organizationId={activeOrg._id} />
    </div>
  );
}

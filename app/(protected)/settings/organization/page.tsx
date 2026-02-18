"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MemberList } from "@/components/organizations/member-list";
import { InviteMemberDialog } from "@/components/organizations/invite-member-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building03Icon, Trash02Icon, Plus01Icon } from "@hugeicons/core-free-icons";

export default function OrganizationSettingsPage() {
  const organizations = useQuery(api.organizations.list);
  const createOrg = useMutation(api.organizations.create);
  const removeOrg = useMutation(api.organizations.remove);

  const [activeOrgId, setActiveOrgId] = useState<Id<"organizations"> | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Id<"organizations"> | null>(null);

  const activeOrg = useMemo(() => {
    if (!organizations) return null;
    return activeOrgId ? organizations.find((o) => o._id === activeOrgId) : organizations[0];
  }, [organizations, activeOrgId]);

  // Initialize active org ID on first load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !activeOrgId) {
      setActiveOrgId(organizations[0]._id);
    }
  }, [organizations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await createOrg({ name: orgName, slug: orgSlug });
      handleMutationSuccess("Organization created successfully");
      setShowCreateForm(false);
      setOrgName("");
      setOrgSlug("");
    } catch (err) {
      handleMutationError(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (orgId: Id<"organizations">) => {
    const confirmed = confirm(
      "Are you sure you want to delete this organization? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(orgId);
    try {
      await removeOrg({ organizationId: orgId });
      handleMutationSuccess("Organization deleted successfully");
      // Switch to another org or clear selection
      if (activeOrgId === orgId && organizations && organizations.length > 1) {
        const nextOrg = organizations.find((o) => o._id !== orgId);
        if (nextOrg) setActiveOrgId(nextOrg._id);
      } else {
        setActiveOrgId(null);
      }
    } catch (err) {
      handleMutationError(err);
    } finally {
      setDeleting(null);
    }
  };

  if (!organizations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            Create Your First Organization
          </h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Organization Details
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
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

              <Button type="submit" disabled={creating} size="sm">
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
      {/* Organizations List Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Your Organizations</h2>
            <p className="text-sm text-muted-foreground">
              Manage and switch between your organizations
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2"
          >
            <HugeiconsIcon icon={Plus01Icon} className="h-4 w-4" />
            New Organization
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Create Organization
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleCreate}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Organization Name</Label>
                  <Input
                    id="create-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Inc"
                    required
                    disabled={creating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-slug">URL Slug</Label>
                  <Input
                    id="create-slug"
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

                <div className="flex gap-2">
                  <Button type="submit" disabled={creating} size="sm">
                    {creating ? "Creating..." : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false);
                      setOrgName("");
                      setOrgSlug("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {organizations.map((org) => {
            const isActive = activeOrgId === org._id;
            const isOwner = org.role === "owner";

            return (
              <Card
                key={org._id}
                className={`cursor-pointer transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "hover:border-muted-foreground/50"
                }`}
                onClick={() => setActiveOrgId(org._id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
                        <HugeiconsIcon
                          icon={Building03Icon}
                          className="h-5 w-5 text-primary"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{org.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{org.slug}</p>
                      </div>
                    </div>
                    {isActive && (
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium shrink-0">
                        Active
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="capitalize">{org.role}</span>
                    {isOwner && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(org._id);
                        }}
                        disabled={deleting === org._id}
                      >
                        <HugeiconsIcon icon={Trash02Icon} className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active Organization Management */}
      {activeOrg && (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{activeOrg.name}</h2>
              <p className="text-sm text-muted-foreground">Manage members and settings</p>
            </div>
            <InviteMemberDialog organizationId={activeOrg._id} />
          </div>

          <MemberList organizationId={activeOrg._id} />
        </div>
      )}
    </div>
  );
}

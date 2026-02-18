"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MemberList } from "@/components/organizations/member-list";
import { InviteMemberDialog } from "@/components/organizations/invite-member-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { HugeiconsIcon } from "@hugeicons/react";
import { Trash02Icon, Plus01Icon } from "@hugeicons/core-free-icons";

const ORG_COLORS = [
  { bg: "bg-orange-100 dark:bg-orange-950", text: "text-orange-700 dark:text-orange-300" },
  { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-300" },
  { bg: "bg-purple-100 dark:bg-purple-950", text: "text-purple-700 dark:text-purple-300" },
  { bg: "bg-pink-100 dark:bg-pink-950", text: "text-pink-700 dark:text-pink-300" },
  { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-300" },
  { bg: "bg-teal-100 dark:bg-teal-950", text: "text-teal-700 dark:text-teal-300" },
  { bg: "bg-indigo-100 dark:bg-indigo-950", text: "text-indigo-700 dark:text-indigo-300" },
];

function getOrgColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ORG_COLORS[hash % ORG_COLORS.length];
}

function RoleBadge({ role }: { role: string }) {
  const roleColors = {
    owner: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    member: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[role as keyof typeof roleColors]}`}>
      {role}
    </span>
  );
}

function OrgMonogram({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const color = getOrgColor(name);
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm font-semibold",
    lg: "w-14 h-14 text-lg font-bold",
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center rounded-lg ${color.bg} ${color.text} flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

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
          <h1 className="text-2xl font-bold tracking-tight">Create Your First Organization</h1>
          <p className="text-sm text-muted-foreground">Get started by creating your first workspace</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Organization Details</CardTitle>
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
                  onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="acme-inc"
                  required
                  disabled={creating}
                />
                <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
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
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* LEFT PANEL — Organizations List */}
      <div className="space-y-4">
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold">Organizations</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full justify-start text-xs h-8 gap-2 text-muted-foreground"
          >
            <HugeiconsIcon icon={Plus01Icon} className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        {showCreateForm && (
          <Card className="animate-in fade-in-0 duration-150">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="quick-name" className="text-xs">Name</Label>
                <Input
                  id="quick-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Inc"
                  disabled={creating}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-slug" className="text-xs">Slug</Label>
                <Input
                  id="quick-slug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="acme-inc"
                  disabled={creating}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" disabled={creating} onClick={handleCreate} className="h-7 flex-1 text-xs">
                  Create
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={creating} onClick={() => { setShowCreateForm(false); setOrgName(""); setOrgSlug(""); }} className="h-7 flex-1 text-xs">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Org List */}
        <div className="space-y-1">
          {organizations.map((org) => {
            const isActive = activeOrgId === org._id;
            const color = getOrgColor(org.name);

            return (
              <button
                key={org._id}
                onClick={() => setActiveOrgId(org._id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all ${
                  isActive
                    ? `${color.bg} ${color.text} border-l-2 border-l-foreground`
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <OrgMonogram name={org.name} size="sm" />
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium truncate">{org.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">/{org.slug}</div>
                </div>
                <RoleBadge role={org.role} />
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL — Active Organization Details */}
      {activeOrg && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-right-2 duration-200">
          {/* Org Header */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <OrgMonogram name={activeOrg.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold truncate">{activeOrg.name}</h1>
                <p className="text-sm text-muted-foreground">/{activeOrg.slug}</p>
              </div>
            </div>

            {/* Org Stats */}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">1</span> member
              </span>
              <span className="text-border">·</span>
              <RoleBadge role={activeOrg.role} />
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">Members</h2>
              <InviteMemberDialog organizationId={activeOrg._id} />
            </div>
            <MemberList organizationId={activeOrg._id} />
          </div>

          <div className="h-px bg-border" />

          {/* Danger Zone */}
          {activeOrg.role === "owner" && (
            <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete this organization and all associated data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(activeOrg._id)}
                disabled={deleting === activeOrg._id}
                className="gap-2"
              >
                <HugeiconsIcon icon={Trash02Icon} className="h-3.5 w-3.5" />
                Delete Organization
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

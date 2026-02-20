"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MemberList } from "@/components/organizations/member-list";
import { NewOrgDialog } from "@/components/organizations/new-org-dialog";
import { DeleteOrgDialog } from "@/components/organizations/delete-org-dialog";
import { OrgMonogram, getRoleBadgeVariant } from "@/components/organizations/org-monogram";
import { InviteMemberDialog } from "@/components/organizations/invite-member-dialog";
import { InvitationList } from "@/components/organizations/invitation-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building03Icon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";

export default function OrganizationSettingsPage() {
  const organizations = useQuery(api.organizations.list);
  const [activeOrgId, setActiveOrgId] = useState<Id<"organizations"> | null>(
    null
  );

  const invitations = useQuery(
    api.members.listInvitations,
    activeOrgId ? { organizationId: activeOrgId } : "skip"
  );

  const activeOrg = useMemo(() => {
    if (!organizations) return null;
    return activeOrgId
      ? organizations.find((o) => o._id === activeOrgId)
      : organizations[0];
  }, [organizations, activeOrgId]);

  useEffect(() => {
    if (organizations && organizations.length > 0 && !activeOrgId) {
      setActiveOrgId(organizations[0]._id);
    }
  }, [organizations, activeOrgId]);

  const handleOrgDeleted = useCallback(() => {
    if (organizations && organizations.length > 1) {
      const nextOrg = organizations.find((o) => o._id !== activeOrgId);
      if (nextOrg) setActiveOrgId(nextOrg._id);
    } else {
      setActiveOrgId(null);
    }
  }, [organizations, activeOrgId]);

  if (!organizations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (organizations.length == 0) {
    return (
      <Card className="  space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Create Your First Organization
          </h1>
          <p className="text-sm text-muted-foreground">
            Get started by creating your first workspace
          </p>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center gap-4">
          <div className="p-3 rounded-lg bg-muted">
            <HugeiconsIcon
              icon={Building03Icon}
              className="h-6 w-6 text-muted-foreground"
            />
          </div>
          <NewOrgDialog />
        </div>
      </Card>
    );
  }

  return (
    <Card className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT SIDEBAR — Organizations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Organizations</h2>
          <NewOrgDialog />
        </div>

        <div className="space-y-1.5">
          {organizations.map((org) => {
            const isActive = activeOrgId === org._id;

            return (
              <Button
                key={org._id}
                onClick={() => setActiveOrgId(org._id)}
                variant={ isActive
                  ? "outline"
                  : "ghost"}
                className={`w-full flex gap-2 items-center   h-10 justify-start text-left text-sm transition-all `}
                
              >
                <OrgMonogram name={org.name} logo={org.logo} size="sm" />
         
                  <div className="font-drmibold truncate">{org.name}</div>
               
          
                <Badge
                  variant={getRoleBadgeVariant(org.role)}
                  className="text-[0.625rem] shrink-0"
                >
                  {org.role}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL — Active Organization Details */}
      {activeOrg && (
        <div className="lg:col-span-2 space-y-6 animate-in fade-in-0 duration-100">
          {/* Org Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <OrgMonogram name={activeOrg.name} logo={activeOrg.logo} size="lg" />
          
                <h1 className="text-2xl font-bold truncate">
                  {activeOrg.name}
                </h1>
              <Badge variant={getRoleBadgeVariant(activeOrg.role)}>
                {activeOrg.role}
              </Badge>
          
            </div>

           
          </div>

           

          {/* Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Members</h2>
              <InviteMemberDialog organizationId={activeOrg._id} />
            </div>
            <MemberList organizationId={activeOrg._id} />
          </div>

          <div className="h-px bg-border/20" />

          {/* Pending Invitations Section */}
          {activeOrg.role === "owner" || activeOrg.role === "admin" ? (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Pending Invitations</h2>
              {invitations ? (
                <InvitationList
                  invitations={invitations}
                  organizationId={activeOrg._id}
                />
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : null}

          {/* Danger Zone */}
          {activeOrg.role === "owner" && (
            <div className="space-y-2 rounded-lg border border-destructive/30  p-4">
              <h3 className="text-sm font-semibold text-destructive">
                Danger Zone
              </h3>
              <p className="text-xs text-muted-foreground">
                Permanently delete this organization and all associated data.
                This action cannot be undone.
              </p>
              <DeleteOrgDialog
                orgId={activeOrg._id}
                orgName={activeOrg.name}
                onDeleted={handleOrgDeleted}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

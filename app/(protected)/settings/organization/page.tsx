"use client";

import { useCallback, useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { useCurrentMember } from "@/hooks/use-current-member";
import { MemberList } from "@/components/organizations/member-list";
import { NewOrgDialog } from "@/components/organizations/new-org-dialog";
import { DeleteOrgDialog } from "@/components/organizations/delete-org-dialog";
import { OrgMonogram, getRoleBadgeVariant } from "@/components/organizations/org-monogram";
import { InviteMemberDialog } from "@/components/organizations/invite-member-dialog";
import { InvitationList } from "@/components/organizations/invitation-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building03Icon, LogoutCircleIcon } from "@hugeicons/core-free-icons";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const organizations = useQuery(api.organizations.list);
  const removeMember = useMutation(api.members.remove);
  const [activeOrgId, setActiveOrgId] = useState<Id<"organizations"> | null>(
    null
  );
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [isLeavingOrg, setIsLeavingOrg] = useState(false);

  const currentMember = useCurrentMember(activeOrgId || (organizations?.[0]?._id as any));

  const invitations = useQuery(
    api.members.listInvitations,
    activeOrgId ? { organizationId: activeOrgId } : "skip"
  );

  const activeOrg = useMemo(() => {
    if (!organizations) return null;
    return activeOrgId
      ? organizations.find((o: any) => o._id === activeOrgId)
      : organizations[0];
  }, [organizations, activeOrgId]);

  useEffect(() => {
    if (organizations && organizations.length > 0 && !activeOrgId) {
      setActiveOrgId(organizations[0]!._id);
    }
  }, [organizations, activeOrgId]);

  const handleOrgDeleted = useCallback(() => {
    if (organizations && organizations.length > 1) {
      const nextOrg = organizations.find((o: any) => o._id !== activeOrgId);
      if (nextOrg) setActiveOrgId(nextOrg._id);
    } else {
      setActiveOrgId(null);
    }
  }, [organizations, activeOrgId]);

  const handleLeaveOrganization = useCallback(async () => {
    if (!activeOrg || !currentMember) return;

    setIsLeavingOrg(true);
    try {
      await removeMember({ memberId: currentMember._id });
      handleMutationSuccess("Left organization successfully");
      setShowLeaveDialog(false);

      // Refresh and switch to another org if available
      setTimeout(() => {
        if (organizations && organizations.length > 1) {
          const nextOrg = organizations.find((o: any) => o._id !== activeOrgId);
          if (nextOrg) setActiveOrgId(nextOrg._id);
        } else {
          setActiveOrgId(null);
        }
        router.refresh();
      }, 500);
    } catch (error) {
      handleMutationError(error, "Failed to leave organization");
    } finally {
      setIsLeavingOrg(false);
    }
  }, [activeOrg, currentMember, activeOrgId, organizations, removeMember, router]);

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
          {organizations.map((org: any) => {
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
          <div className="space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            {activeOrg.role === "owner" ? (
              <>
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
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-destructive">
                  Leave Organization
                </h3>
                <p className="text-xs text-muted-foreground">
                  You will no longer have access to this organization and its data.
                </p>
                <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowLeaveDialog(true)}
                    disabled={isLeavingOrg}
                  >
                    <HugeiconsIcon icon={LogoutCircleIcon} className="mr-2 h-4 w-4" />
                    Leave Organization
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave Organization?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to leave <strong>{activeOrg.name}</strong>? You will no longer have access to this organization and its data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel disabled={isLeavingOrg}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLeaveOrganization}
                        disabled={isLeavingOrg}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isLeavingOrg ? "Leaving..." : "Leave"}
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

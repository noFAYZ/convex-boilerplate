"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteMemberModal } from "@/components/team/invite-member-modal";
import { MembersList } from "@/components/team/members-list";
import { useOrganization } from "@/components/organizations/org-context";
import { Users, UserPlus, Mail, Loader2 } from "lucide-react";

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const currentUser = useQuery(api.users.getCurrent);
  const { currentOrganization } = useOrganization();

  const members = useQuery(
    api.members.list,
    currentOrganization ? { organizationId: currentOrganization._id } : "skip"
  );
  const invitations = useQuery(
    api.members.listInvitations,
    currentOrganization ? { organizationId: currentOrganization._id } : "skip"
  );

  const currentMember = members?.find((m) => m.userId === currentUser?._id);
  const currentUserRole = currentMember?.role || "member";
  const canInvite = currentUserRole === "owner" || currentUserRole === "admin";

  if (!currentUser || !currentOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage members and invitations for {currentOrganization.name}
          </p>
        </div>
        {canInvite && (
          <Button
            onClick={() => setShowInviteModal(true)}
            size="sm"
            className="gap-1.5 h-8 text-[13px]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xl font-bold tabular-nums">
                  {members?.length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">Active members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {canInvite && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold tabular-nums">
                    {invitations?.length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pending invites
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Members ({members?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <MembersList
              members={members}
              currentUserRole={currentUserRole}
              currentUserId={currentUser._id}
              onUpdate={() => {}}
            />
          ) : (
            <div className="text-center py-10">
              <Users className="h-6 w-6 text-muted-foreground/25 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canInvite && invitations && invitations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0.5">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">
                        {invitation.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invitation.role} &middot;{" "}
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-xs font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showInviteModal && (
        <InviteMemberModal
          organizationId={currentOrganization._id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}

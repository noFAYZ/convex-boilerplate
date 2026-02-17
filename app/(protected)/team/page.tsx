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
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          </div>
          <p className="text-muted-foreground pl-11">
            Manage members and invitations for {currentOrganization.name}
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setShowInviteModal(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">Active members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {canInvite && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Mail className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{invitations?.length ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Pending invites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
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
            <div className="text-center py-12">
              <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canInvite && invitations && invitations.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {invitation.role} &middot;{" "}
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
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

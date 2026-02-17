"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <h1 className="text-3xl font-bold">Team Members</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your organization&apos;s team and invitations
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setShowInviteModal(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Members</CardDescription>
            <CardTitle className="text-3xl">{members?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Team members with access to {currentOrganization.name}
            </p>
          </CardContent>
        </Card>

        {canInvite && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Invitations</CardDescription>
              <CardTitle className="text-3xl">{invitations?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Invitations waiting to be accepted
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({members?.length || 0})
          </CardTitle>
          <CardDescription>
            View and manage team member roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members && members.length > 0 ? (
            <MembersList
              members={members}
              currentUserRole={currentUserRole}
              currentUserId={currentUser._id}
              onUpdate={() => {
                // Queries will automatically refetch
              }}
            />
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">No members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canInvite && invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({invitations.length})
            </CardTitle>
            <CardDescription>
              These invitations are waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited as {invitation.role} •{" "}
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal
          organizationId={currentOrganization._id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, CheckCircle } from "@hugeicons/core-free-icons";
import { VerificationDialog } from "@/components/auth/verification-dialog";
import { useState, useCallback } from "react";

export default function EmailSettingsPage() {
  const user = useQuery(api.users.getCurrent);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestVerification = useMutation(api.emailVerification.requestVerification);

  const isEmailVerified = user?.emailVerificationTime;
  const verifiedDate = isEmailVerified
    ? new Date(user.emailVerificationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const handleRequestVerification = useCallback(async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      await requestVerification({ email: user.email });
      handleMutationSuccess("Verification code sent to your email");
      setShowVerificationDialog(true);
    } catch (err) {
      handleMutationError(err, "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, requestVerification]);

  return (
    <div className="space-y-6">
      {/* Email Address */}
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Your email address is used for notifications and account recovery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Email</p>
            <p className="text-sm font-semibold">{user?.email || "Loading..."}</p>
          </div>

          {/* Verification Status */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              {isEmailVerified ? (
                <>
                  <HugeiconsIcon icon={CheckCircle} className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Email Verified
                  </span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Email Not Verified
                  </span>
                </>
              )}
            </div>

            {isEmailVerified ? (
              <p className="text-xs text-muted-foreground">
                Verified on {verifiedDate}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Please verify your email to ensure you receive important account notifications
              </p>
            )}

            <Button
              onClick={handleRequestVerification}
              disabled={isLoading}
              variant={isEmailVerified ? "outline" : "default"}
              size="sm"
            >
              {isLoading ? "Sending code..." : isEmailVerified ? "Re-verify" : "Verify Email"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how you receive notifications about your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              {
                title: "Member Invitations",
                description: "When you're invited to an organization",
                enabled: true,
              },
              {
                title: "Team Updates",
                description: "When team members are added or roles change",
                enabled: true,
              },
              {
                title: "Account Changes",
                description: "When your account or organization settings change",
                enabled: true,
              },
            ].map((notif) => (
              <div
                key={notif.title}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.description}</p>
                </div>
                <Badge variant={notif.enabled ? "default" : "secondary"}>
                  {notif.enabled ? "On" : "Off"}
                </Badge>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            💡 <strong>Note:</strong> Notification preferences coming soon. All notifications are currently enabled to ensure you don't miss important updates.
          </div>
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <VerificationDialog
        email={user?.email || ""}
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        onSuccess={() => {
          // Dialog will close automatically
        }}
      />
    </div>
  );
}

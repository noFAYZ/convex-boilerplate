"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { handleMutationError, handleMutationSuccess } from "@/lib/error-handler";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01FreeIcons, AlertCircleIcon, X as CloseIcon } from "@hugeicons/core-free-icons";
import { VerificationDialog } from "./verification-dialog";

export function EmailVerificationBanner() {
  const user = useQuery(api.users.getCurrent);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const requestVerification = useMutation(api.emailVerification.requestVerification);

  // Hide banner if email is already verified
  if (!user || user.emailVerificationTime) {
    return null;
  }

  const handleSendCode = useCallback(async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      await requestVerification({ email: user.email });
      handleMutationSuccess("Verification code sent to your email");
      setShowDialog(true);
    } catch (err) {
      handleMutationError(err, "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, requestVerification]);

  return (
    <>
      <div className="bg-accent/50 dark:bg-amber-950/20  dark:border-amber-900 px-4 py-2 flex items-center gap-2 sticky top-0  z-10">
        <HugeiconsIcon
          icon={Alert01FreeIcons}
          className="h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-400"
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Verify your email address</p>
    
        </div>

        <Button
          onClick={handleSendCode}
          disabled={isLoading}
          size="sm"
          className="flex-shrink-0"
        >
          {isLoading ? "Sending..." : "Verify now"}
        </Button>

      {/*   <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-5 w-5 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          onClick={() => {
            // Allow dismissing the banner - can still verify from banner button
          }}
          aria-label="Dismiss"
        >
          <HugeiconsIcon icon={CloseIcon} className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </Button> */}
      </div>

      {/* Verification Dialog */}
      <VerificationDialog
        email={user?.email || ""}
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={() => {
          // Banner will auto-hide when email is verified
        }}
      />
    </>
  );
}

"use client";

import { memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { SolarBillCheckBoldDuotone } from "@/components/icons/icons";
import { PLANS, type PlanType } from "@/lib/plans";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSyncing: boolean;
  currentPlan: PlanType;
  renewalDate?: number;
}

const SuccessDialog = memo(function SuccessDialog({
  open,
  onOpenChange,
  isSyncing,
  currentPlan,
  renewalDate,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {isSyncing ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold">Updating your subscription...</p>
              <p className="text-sm text-muted-foreground">
                We're syncing your details with our payment provider
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-lg bg-gradient-to-br from-lime-100 to-lime-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3">
                  <SolarBillCheckBoldDuotone className="h-12 w-12 text-lime-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <DialogTitle className="text-2xl font-bold">
                  Welcome to {PLANS[currentPlan]?.name}!
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {currentPlan === "free"
                    ? "Your subscription has been updated."
                    : `Your subscription is now active. You have full access to all ${PLANS[currentPlan]?.name} features.`}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Plan Details Card */}
              <div className="rounded-lg border bg-card p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Plan
                    </p>
                    <Badge className="text-lg font-bold mt-1" variant="secondary">
                      {PLANS[currentPlan]?.name}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Price
                    </p>
                    <p className="text-lg font-bold mt-1">{PLANS[currentPlan]?.price}</p>
                  </div>
                  {renewalDate && currentPlan !== "free" && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Renews
                      </p>
                      <p className="text-lg font-bold mt-1">
                        {new Date(renewalDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Card */}
              {currentPlan !== "free" && (
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 p-4">
                  <p className="text-sm font-semibold mb-3 text-blue-900 dark:text-blue-200">
                    You now have access to:
                  </p>
                  <ul className="space-y-2">
                    {PLANS[currentPlan]?.features?.slice(0, 3).map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2"
                      >
                        <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogClose asChild>
              <Button className="w-full h-11 font-semibold" variant="default">
                Get Started
              </Button>
            </DialogClose>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default SuccessDialog;

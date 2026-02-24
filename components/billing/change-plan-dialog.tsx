"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlanCard } from "./plan-card";
import { type PlanType } from "@/lib/plans";

interface ChangePlanDialogProps {
  currentPlan: PlanType;
  isActive?: boolean;
  onUpgrade: (plan: PlanType) => Promise<void>;
  onCancel: () => Promise<void>;
  loading?: boolean;
}

export function ChangePlanDialog({
  currentPlan,
  isActive = false,
  onUpgrade,
  onCancel,
  loading = false,
}: ChangePlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpgrade = async (plan: PlanType) => {
    if (plan === "free" || plan === "enterprise") return;
    await onUpgrade(plan);
  };

  const handleCancel = async () => {
    await onCancel();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild size={'sm'}>
        <Button>Change Plan</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Upgrade or downgrade your plan. Changes take effect immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 py-6">
          {(["free", "pro", "enterprise"] as const).map((plan) => (
            <PlanCard
              key={plan}
              plan={plan}
              isCurrentPlan={currentPlan === plan}
              isActive={isActive && currentPlan === plan}
              onUpgrade={() => handleUpgrade(plan)}
              onCancel={handleCancel}
              loading={loading}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

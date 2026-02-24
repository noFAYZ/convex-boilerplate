"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, PlanType } from "@/lib/plans";
import { CheckCircleIcon } from "@phosphor-icons/react";

interface PlanCardProps {
  plan: PlanType;
  isCurrentPlan: boolean;
  isActive?: boolean;
  onUpgrade?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  isActive = false,
  onUpgrade,
  onCancel,
  loading = false,
}: PlanCardProps) {
  const planData = PLANS[plan];
  const isEnterprise = plan === "enterprise";

  if (!planData) return null;

  return (
    <Card
      className={`relative flex flex-col h-full overflow-visible ring-0 ${
        isCurrentPlan ? " border-primary shadow-lg" : "hover:shadow-md"
      }`}
    >
      {isCurrentPlan && (
        <div className="absolute -top-3 left-4">
          <Badge variant="default" className="bg-primary">
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-xl ">{planData.name}</CardTitle>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{planData.price}</span>
            {planData.billingPeriod && (
              <span className="text-muted-foreground">{planData.billingPeriod}</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Features List */}
        <div className="space-y-1.5 flex-1">
          {planData.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircleIcon className="h-4 w-4 text-lime-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" weight="fill" />
              <span className="text-xs text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-6 pt-4 space-y-2">
          {isCurrentPlan ? (
            <>
              <Button disabled className="w-full" variant={'outline'}>
                Current Plan
              </Button>
              {isActive && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {loading ? "Canceling..." : "Cancel Plan"}
                </Button>
              )}
            </>
          ) : plan === "free" ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={onCancel}
              disabled={loading}
            >
              {loading ? "Processing..." : "Downgrade"}
            </Button>
          ) : isEnterprise ? (
            <Button
              className="w-full"
              onClick={() => {
                window.open("mailto:sales@example.com?subject=Enterprise Plan Inquiry", "_blank");
              }}
            >
              Contact Sales
            </Button>
          ) : (
            <Button className="w-full" onClick={onUpgrade} disabled={loading}>
              {loading ? "Processing..." : planData.cta}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

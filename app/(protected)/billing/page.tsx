"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useQuery, useAction } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChangePlanDialog } from "@/components/billing/change-plan-dialog";
import { TransactionsTable } from "@/components/billing/transactions-table";
import SuccessDialog from "@/components/billing/success-dialog";
import CancelConfirmDialog from "@/components/billing/cancel-confirm-dialog";
import { PLANS, type PlanType } from "@/lib/plans";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncAttemptedRef = useRef(false);

  const subscription = useQuery(api.billing.getSubscription);
  const createCheckout = useAction(api.actions.billing.createCheckoutSession);
  const cancelSub = useAction(api.actions.billing.cancelSubscription);
  const reactivateSub = useAction(api.actions.billing.reactivateSubscription);
  const fetchInvoices = useAction(api.actions.billing.getInvoices);
  const syncSubscription = useAction(api.actions.billing.syncSubscription);

  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch invoices when subscription changes
  useEffect(() => {
    if (subscription !== undefined) {
      setOrdersLoading(true);
      fetchInvoices()
        .then((data) => {
          setOrdersData(data || []);
        })
        .catch(() => {
          setOrdersData([]);
        })
        .finally(() => {
          setOrdersLoading(false);
        });
    }
  }, [subscription?._id]);

  // Handle success redirect - sync subscription from Polar with retries
  useEffect(() => {
    const handleSuccess = async () => {
      if (searchParams.get("success") && !syncAttemptedRef.current) {
        syncAttemptedRef.current = true;
        setIsSyncing(true);

        // Retry logic - Polar subscription takes 3-5 seconds to be created after checkout
        let retries = 0;
        const maxRetries = 8;
        let lastError: string = "";

        while (retries < maxRetries) {
          try {
            console.log(`[PAGE] Calling syncSubscription... (attempt ${retries + 1}/${maxRetries})`);
            const result = await syncSubscription();
            console.log("[PAGE] Sync result:", result);
            setShowSuccessDialog(true);
            toast.success("Subscription updated successfully!");
            setIsSyncing(false);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          } catch (error) {
            lastError = error instanceof Error ? error.message : "Failed to sync subscription";
            console.error(`[PAGE] Sync error (attempt ${retries + 1}):`, lastError, error);
            retries++;

            if (retries < maxRetries) {
              // Wait longer on each retry - Polar API takes time to create subscription
              const waitTime = retries < 3 ? 2000 : 3000; // 2s for first 3, then 3s
              console.log(`[PAGE] Retrying in ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }
        }

        // All retries failed - still show success dialog since webhook might arrive
        console.error("[PAGE] Sync failed after retries:", lastError);
        toast.error(`Sync still pending. Subscription data will update when available.`);
        setShowSuccessDialog(true); // Show success dialog anyway - webhook might arrive
        setIsSyncing(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (searchParams.get("error")) {
        toast.error("Something went wrong. Please try again.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleSuccess();
  }, [searchParams, syncSubscription]);

  const currentPlan = (subscription?.plan || "free") as PlanType;

  const handleUpgrade = useCallback(
    async (plan: PlanType) => {
      if (plan === "free" || plan === "enterprise") {
        return;
      }

      setLoadingPlan(plan);
      try {
        const { checkoutUrl } = await createCheckout({ plan });
        // Redirect to checkout in same tab to handle success properly
        window.location.href = checkoutUrl;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create checkout";
        toast.error(message);
        setLoadingPlan(null);
      }
    },
    [createCheckout]
  );

  const handleCancelConfirm = useCallback(async () => {
    setShowCancelDialog(false);
    setLoadingPlan("cancel");
    try {
      await cancelSub();
      toast.success("Subscription will be canceled at the end of your billing period");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel subscription";
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  }, [cancelSub, router]);

  const handleReactivate = useCallback(async () => {
    setLoadingPlan("reactivate");
    try {
      await reactivateSub();
      toast.success("Subscription reactivated successfully");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reactivate subscription";
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  }, [reactivateSub, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 flex justify-between items-start">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Billing Settings</h1>
          <p className="text-xs text-muted-foreground">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            setIsSyncing(true);
            try {
              await syncSubscription();
              toast.success("Subscription synced!");
              router.refresh();
            } catch (error) {
              const msg = error instanceof Error ? error.message : "Sync failed";
              toast.error(msg);
            } finally {
              setIsSyncing(false);
            }
          }}
          disabled={isSyncing}
        >
          {isSyncing ? "Syncing..." : "Sync Subscription"}
        </Button>
      </div>

      {/* Loading State */}
      {subscription === undefined ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading billing information...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Section 1: Current Subscription */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{PLANS[currentPlan]?.name || "Free"}</p>
              </div>
              <Badge
                variant={subscription?.status === "active" ? "default" : "secondary"}
              >
                {subscription?.status || "free"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Billing Cycle</p>
                  <p className="text-sm font-semibold mt-1">
                    {currentPlan === "free"
                      ? "No active billing"
                      : subscription?.currentPeriodEnd
                        ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan Price</p>
                  <p className="text-sm font-semibold mt-1">{PLANS[currentPlan]?.price}</p>
                </div>
              </div>

              {subscription?.cancelAtPeriodEnd && (
                <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      Subscription Scheduled for Cancellation
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                      Your subscription will be canceled at the end of your billing period on{" "}
                      <span className="font-semibold">
                        {subscription?.currentPeriodEnd
                          ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {subscription?.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleReactivate}
                    disabled={loadingPlan === "reactivate"}
                    className="flex-1"
                     size="sm"
                  >
                    {loadingPlan === "reactivate" ? "Reactivating..." : "Reactivate Subscription"}
                  </Button>
                ) : (
                  <>
                    <ChangePlanDialog
                      currentPlan={currentPlan}
                      isActive={subscription?.status === "active"}
                      onUpgrade={handleUpgrade}
                      onCancel={async () => setShowCancelDialog(true)}
                      loading={loadingPlan === "cancel" || !!loadingPlan}
                    />
                    {currentPlan !== "free" && subscription?.status === "active" && (
                      <Button
                        variant="destructive"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={loadingPlan === "cancel"}
                        size="sm"
                      >
                        {loadingPlan === "cancel" ? "Canceling..." : "Cancel Subscription"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentPlan === "free" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    No payment method on file. Upgrade to Pro to add a payment method.
                  </p>
                  <ChangePlanDialog
                    currentPlan={currentPlan}
                    isActive={subscription?.status === "active"}
                    onUpgrade={handleUpgrade}
                    onCancel={async () => setShowCancelDialog(true)}
                    loading={loadingPlan === "cancel" || !!loadingPlan}
                  />
                </>
              ) : (
                <>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Your payment method is managed by </span>
                    <span className="font-semibold">Polar</span>
                  </p>
                  <Button
                    variant="outline"
                    asChild
                           size="sm"
                  >
                    <a
                      href="https://polar.sh/settings/payment-methods"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Manage Payment Methods →
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsTable transactions={ordersData} loading={ordersLoading} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelConfirm}
        isLoading={loadingPlan === "cancel"}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        isSyncing={isSyncing}
        currentPlan={currentPlan}
        renewalDate={subscription?.currentPeriodEnd}
      />
    </div>
  );
}

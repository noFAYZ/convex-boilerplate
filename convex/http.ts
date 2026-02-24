import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { internal } from "./_generated/api";

const http = httpRouter();

// Add custom routes BEFORE auth routes
http.route({
  path: "/webhook-test",
  method: "GET",
  handler: ((_ctx: any) =>
    new Response(
      JSON.stringify({
        status: "ok",
        message: "Webhook endpoint is reachable",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )) as any,
});

auth.addHttpRoutes(http);

const PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID || "";

async function handleSubscriptionEvent(
  ctx: any,
  subscription: any,
  eventType: string
) {
  if (!subscription || !subscription.id) {
    console.error("[WEBHOOK] Missing subscription or subscription.id");
    return;
  }

  // Extract email from various possible fields
  const customerEmail =
    subscription.customerEmail ||
    subscription.customer_email ||
    subscription.customer?.email ||
    subscription.customer?.emailAddress;

  if (!customerEmail) {
    console.error("[WEBHOOK] Could not extract customer email from payload");
    return;
  }

  const users = await ctx.runQuery(internal.users.getByEmailInternal, {
    email: customerEmail,
  });

  if (!users || users.length === 0) {
    console.error("[WEBHOOK] No user found with email:", customerEmail);
    return;
  }

  const userId = users[0]._id;

  // Extract product ID
  const productId =
    subscription.productId ||
    subscription.product_id ||
    subscription.product?.id ||
    subscription.items?.[0]?.product?.id ||
    subscription.items?.[0]?.productId;

  const isPro = productId === PRO_PRODUCT_ID;
  const plan = isPro ? "pro" : "free";

  // Get billing period end
  const periodEnd =
    subscription.currentPeriodEnd ||
    subscription.current_period_end ||
    subscription.endsAt ||
    subscription.ends_at ||
    subscription.currentBillingPeriod?.endsAt ||
    subscription.current_billing_period?.ends_at;

  // Get customer ID
  const customerId = subscription.customerId || subscription.customer_id || subscription.customer?.id;

  // Determine status based on event type
  let status: "active" | "canceled" | "past_due" | "incomplete" = "active";
  let cancelAtPeriodEnd = subscription.cancelAtPeriodEnd || subscription.cancel_at_period_end || false;

  if (eventType === "subscription.canceled") {
    cancelAtPeriodEnd = true;
    status = subscription.status === "active" ? "active" : "canceled";
  } else if (eventType === "subscription.revoked") {
    status = "canceled";
    cancelAtPeriodEnd = false;
  } else if (eventType === "subscription.uncanceled") {
    cancelAtPeriodEnd = false;
    status = "active";
  } else if (eventType === "subscription.active") {
    status = "active";
    cancelAtPeriodEnd = false;
  } else if (eventType === "subscription.updated") {
    status = subscription.status || "active";
    cancelAtPeriodEnd = subscription.cancelAtPeriodEnd || subscription.cancel_at_period_end || false;
  }

  await ctx.runMutation(internal.billing.upsertSubscription, {
    userId,
    polarSubscriptionId: subscription.id,
    polarCustomerId: customerId,
    plan,
    status,
    currentPeriodEnd: periodEnd ? new Date(periodEnd).getTime() : 0,
    cancelAtPeriodEnd,
  });
}

// Polar webhook endpoint
http.route({
  path: "/polar-webhook",
  method: "POST",
  handler: ((ctx: any) => {
    return (async () => {
      let eventPayload: any = null;
      try {
        const secret = process.env.POLAR_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[WEBHOOK] POLAR_WEBHOOK_SECRET not configured");
          return new Response(
            JSON.stringify({ error: "POLAR_WEBHOOK_SECRET not configured" }),
            { status: 500 }
          );
        }

        const body = await ctx.request.text();
        eventPayload = JSON.parse(body);

        // Verify webhook signature using standard headers
        const webhookId = ctx.request.headers.get("webhook-id");
        const webhookTimestamp = ctx.request.headers.get("webhook-timestamp");
        const webhookSignature = ctx.request.headers.get("webhook-signature");

        if (!webhookId || !webhookTimestamp || !webhookSignature) {
          console.error("[WEBHOOK] Missing webhook signature headers");
          return new Response(
            JSON.stringify({ error: "Missing webhook signature headers" }),
            { status: 401 }
          );
        }

        const eventType = eventPayload?.type;
        if (!eventType) {
          console.error("[WEBHOOK] No event type in webhook payload");
          return new Response(
            JSON.stringify({ error: "No event type in webhook payload" }),
            { status: 400 }
          );
        }

        // Handle subscription-related events
        const subscriptionEvents = [
          "subscription.created",
          "subscription.updated",
          "subscription.active",
          "subscription.canceled",
          "subscription.revoked",
          "subscription.uncanceled",
        ];

        if (subscriptionEvents.includes(eventType)) {
          await handleSubscriptionEvent(ctx, eventPayload.data, eventType);
        }

        return new Response(JSON.stringify({ success: true, type: eventType }), {
          status: 200,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        console.error("[WEBHOOK] Webhook processing error:", errorMessage);

        return new Response(
          JSON.stringify({
            error: "Webhook processing failed",
            detail: errorMessage,
            eventType: eventPayload?.type,
          }),
          { status: 500 }
        );
      }
    })();
  }) as any,
});

export default http;

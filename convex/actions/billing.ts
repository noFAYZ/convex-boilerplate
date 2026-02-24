"use node";

import { action } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "../_generated/api";
import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

const PRODUCT_IDS = {
  pro: process.env.POLAR_PRO_PRODUCT_ID,
} as const;

export const createCheckoutSession = action({
  args: { plan: v.union(v.literal("pro")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const user = await ctx.runQuery(internal.users.getCurrentInternal);
    if (!user || !user.email) {
      throw new Error("User not found or email missing");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const productId = PRODUCT_IDS[args.plan];

    if (!productId) {
      throw new Error(`Product ID not configured for plan: ${args.plan}`);
    }

    try {
      const checkout = await polar.checkouts.create({
        products: [productId],
        customerEmail: user.email,
        successUrl: `${appUrl}/billing?success=true`,
      });

      if (!checkout.url) {
        throw new Error("Checkout URL not provided by Polar");
      }

      return { checkoutUrl: checkout.url };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to create checkout session: ${message}`);
    }
  },
});

export const cancelSubscription = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const subscription = await ctx.runQuery(
      internal.billing.getSubscriptionInternal,
      { userId }
    );

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    if (subscription.status !== "active") {
      throw new Error("Can only cancel active subscriptions");
    }

    try {
      await polar.subscriptions.update({
        id: subscription.polarSubscriptionId,
        subscriptionUpdate: {
          cancelAtPeriodEnd: true,
        },
      });

      await ctx.runMutation(internal.billing.upsertSubscription, {
        userId,
        polarSubscriptionId: subscription.polarSubscriptionId,
        polarCustomerId: subscription.polarCustomerId,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: true,
      });

      return { success: true, message: "Subscription will be canceled at period end" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to cancel subscription: ${message}`);
    }
  },
});

export const reactivateSubscription = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const subscription = await ctx.runQuery(
      internal.billing.getSubscriptionInternal,
      { userId }
    );

    if (!subscription) {
      throw new Error("No subscription found");
    }

    if (!subscription.cancelAtPeriodEnd) {
      throw new Error("Subscription is not scheduled for cancellation");
    }

    try {
      await polar.subscriptions.update({
        id: subscription.polarSubscriptionId,
        subscriptionUpdate: {
          cancelAtPeriodEnd: false,
        },
      });

      await ctx.runMutation(internal.billing.upsertSubscription, {
        userId,
        polarSubscriptionId: subscription.polarSubscriptionId,
        polarCustomerId: subscription.polarCustomerId,
        plan: subscription.plan,
        status: "active",
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });

      return { success: true, message: "Subscription reactivated successfully" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to reactivate subscription: ${message}`);
    }
  },
});


export const getInvoices = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const subscription = await ctx.runQuery(
      internal.billing.getSubscriptionInternal,
      { userId }
    );

    if (!subscription) {
      console.log("[INVOICES] No subscription found");
      return [];
    }

    console.log("[INVOICES] Fetching for customer:", subscription.polarCustomerId);

    try {
      const invoices: Array<{
        id: string;
        createdAt: string;
        productName: string;
        amount: number;
        currency: string;
        status: string;
        invoiceUrl?: string;
      }> = [];

      try {
        const result = await polar.orders.list({
          customerId: subscription.polarCustomerId,
        });

        console.log("[INVOICES] Orders result received, type:", typeof result);

        let ordersArray: any[] = [];

        if (result && typeof result[Symbol.asyncIterator] === 'function') {
          console.log("[INVOICES] Processing as async iterator");
          for await (const order of result) {
            // Handle Polar SDK wrapper
            if ((order as any).result?.items) {
              ordersArray.push(...((order as any).result.items as any[]));
            } else {
              ordersArray.push(order);
            }
          }
        } else if (Array.isArray(result)) {
          console.log("[INVOICES] Processing as array, count:", result.length);
          ordersArray = result;
        } else if (result && (result as any).result?.items) {
          console.log("[INVOICES] Processing wrapped response");
          ordersArray = (result as any).result.items;
        } else if (result && typeof result === 'object') {
          console.log("[INVOICES] Processing as single object");
          ordersArray = [result];
        }

        console.log("[INVOICES] Total orders found:", ordersArray.length);

        for (const order of ordersArray) {
          const mapped = mapOrderToInvoice(order);
          if (mapped) invoices.push(mapped);
        }

        console.log("[INVOICES] Total invoices mapped:", invoices.length);
        return invoices.reverse();
      } catch (listError) {
        console.error("[INVOICES] Error fetching orders:", listError);
        return [];
      }
    } catch (error) {
      console.error("[INVOICES] Error:", error);
      return [];
    }
  },
});

export const syncSubscription = action({
  args: {},
  handler: async (ctx) => {
    console.log("[SYNC] Starting syncSubscription action");

    const userId = await getAuthUserId(ctx);
    console.log("[SYNC] User ID:", userId);
    if (!userId) {
      throw new Error("Authentication required");
    }

    const user = await ctx.runQuery(internal.users.getCurrentInternal);
    console.log("[SYNC] User:", user?.email);
    if (!user || !user.email) {
      throw new Error("User not found or email missing");
    }

    let subscription = await ctx.runQuery(
      internal.billing.getSubscriptionInternal,
      { userId }
    );
    console.log("[SYNC] Existing subscription:", subscription ? `${subscription.plan}/${subscription.status}` : "none");

    let customerId = subscription?.polarCustomerId;
    console.log("[SYNC] Customer ID from DB:", customerId);

    // Alternative: Try to find subscription by customer email directly from Polar
    if (!customerId) {
      console.log("[SYNC] Trying alternative: search subscriptions by customer email");
      try {
        const subs = await polar.subscriptions.list({});
        console.log("[SYNC] Got subscriptions list (alternative method)");

        let subArray: any[] = [];
        if (subs && typeof subs[Symbol.asyncIterator] === 'function') {
          for await (const s of subs) {
            // Handle Polar SDK wrapper
            if ((s as any).result?.items) {
              subArray.push(...((s as any).result.items as any[]));
            } else {
              subArray.push(s);
            }
          }
        } else if (Array.isArray(subs)) {
          subArray = subs;
        } else if (subs && (subs as any).result?.items) {
          subArray = (subs as any).result.items;
        }

        console.log("[SYNC] Total subscriptions:", subArray.length);

        // Find subscription with matching customer email
        const matchingSub = subArray.find(
          (s: any) =>
            (s as any).customer?.email === user.email ||
            (s as any).customerEmail === user.email
        );

        if (matchingSub) {
          console.log("[SYNC] Found matching subscription");
          customerId = (matchingSub as any).customer?.id || (matchingSub as any).customerId;
          console.log("[SYNC] Extracted customer ID from subscription:", customerId);
        }
      } catch (error) {
        console.error("[SYNC] Error in alternative subscription search:", error);
      }
    }

    // If we don't have a customer ID, try to find it from Polar by email
    if (!customerId) {
      console.log("[SYNC] Searching Polar for customer by email:", user.email);
      try {
        const customers = await polar.customers.list({
          email: user.email,
        });

        console.log("[SYNC] Polar customers response received");
        console.log("[SYNC] Response type:", typeof customers);
        console.log("[SYNC] Is async iterator?", customers && typeof (customers as any)[Symbol.asyncIterator] === 'function');
        console.log("[SYNC] Is array?", Array.isArray(customers));
        console.log("[SYNC] Full response:", JSON.stringify(customers, null, 2));

        let customersArray: any[] = [];

        if (customers && typeof customers[Symbol.asyncIterator] === 'function') {
          console.log("[SYNC] Processing as async iterator");
          for await (const customer of customers) {
            // Polar SDK wraps response in { result: { items: [...] } }
            if ((customer as any).result?.items) {
              console.log("[SYNC] Found items in result wrapper");
              customersArray.push(...((customer as any).result.items as any[]));
            } else {
              customersArray.push(customer);
            }
          }
        } else if (Array.isArray(customers)) {
          console.log("[SYNC] Processing as array");
          customersArray = customers;
        } else if (customers && (customers as any).result?.items) {
          console.log("[SYNC] Processing wrapped response with items");
          customersArray = (customers as any).result.items;
        } else if (customers) {
          console.log("[SYNC] Processing as single object");
          customersArray = [customers];
        }

        console.log("[SYNC] Total customers found:", customersArray.length);

        if (customersArray.length > 0) {
          const firstCustomer = customersArray[0] as any;
          console.log("[SYNC] First customer object:", JSON.stringify(firstCustomer));
          console.log("[SYNC] First customer keys:", Object.keys(firstCustomer));

          // Try different property names
          customerId = firstCustomer.id || firstCustomer.customerId || firstCustomer.customer_id;
          console.log("[SYNC] Extracted customer ID:", customerId);
        }
      } catch (error) {
        console.error("[SYNC] Error searching for customer:", error);
        throw new Error("Could not find Polar customer");
      }
    }

    if (!customerId) {
      console.error("[SYNC] No customer ID found");
      throw new Error("No Polar customer found");
    }

    try {
      console.log("[SYNC] Fetching subscriptions from Polar for customer:", customerId);
      const subscriptions = await polar.subscriptions.list({
        customerId,
      });

      let activeSubscription: any = null;
      let subsArray: any[] = [];

      if (subscriptions && typeof subscriptions[Symbol.asyncIterator] === 'function') {
        for await (const sub of subscriptions) {
          // Handle Polar SDK wrapper
          if ((sub as any).result?.items) {
            subsArray.push(...((sub as any).result.items as any[]));
          } else {
            subsArray.push(sub);
          }
        }
      } else if (Array.isArray(subscriptions)) {
        subsArray = subscriptions;
      } else if (subscriptions && (subscriptions as any).result?.items) {
        subsArray = (subscriptions as any).result.items;
      }

      console.log("[SYNC] Total subscriptions found:", subsArray.length);

      for (const sub of subsArray) {
        console.log("[SYNC] Checking subscription:", (sub as any).id, "status:", (sub as any).status);
        if ((sub as any).status === "active" || (sub as any).status === "trialing") {
          activeSubscription = sub;
          console.log("[SYNC] Found active subscription");
          break;
        }
      }

      if (!activeSubscription) {
        console.log("[SYNC] No active subscription found in Polar - downgrading to free");
        // Customer has no active subscription (deleted, canceled, etc) - downgrade to free
        await ctx.runMutation(internal.billing.removeSubscription, {
          userId,
        });
        return { success: true, plan: "free", message: "No active subscription found - downgraded to free" };
      }

      // Extract plan from product ID
      const productId = activeSubscription.productId || activeSubscription.product?.id;
      console.log("[SYNC] Product ID:", productId, "Pro ID:", PRODUCT_IDS.pro);
      const isPro = productId === PRODUCT_IDS.pro;
      const plan = isPro ? "pro" : "free";
      console.log("[SYNC] Determined plan:", plan);

      // Extract period end date
      const periodEnd =
        activeSubscription.currentPeriodEnd ||
        activeSubscription.current_period_end ||
        activeSubscription.endsAt ||
        activeSubscription.ends_at;

      console.log("[SYNC] Period end:", periodEnd);

      // Upsert the subscription in Convex
      console.log("[SYNC] Upserting subscription to Convex...");
      await ctx.runMutation(internal.billing.upsertSubscription, {
        userId,
        polarSubscriptionId: activeSubscription.id,
        polarCustomerId: customerId,
        plan,
        status: activeSubscription.status as "active" | "canceled" | "past_due" | "incomplete",
        currentPeriodEnd: periodEnd ? new Date(periodEnd).getTime() : Date.now(),
        cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd || activeSubscription.cancel_at_period_end || false,
      });

      console.log("[SYNC] Success! Synced plan:", plan);
      return { success: true, plan };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("[SYNC] Error:", message, error);
      throw new Error(`Failed to sync subscription: ${message}`);
    }
  },
});

// Helper function to map Polar order to invoice format
function mapOrderToInvoice(order: any) {
  if (!order || !order.id) {
    return null;
  }

  // Ensure all values are primitives that Convex can serialize
  let createdAt = order.createdAt || order.created_at;
  if (createdAt instanceof Date) {
    createdAt = createdAt.toISOString();
  }
  if (!createdAt || typeof createdAt !== 'string') {
    createdAt = new Date().toISOString();
  }

  const amount = Number(order.amount || order.totalAmount || order.total_amount || 0);
  const currency = String(order.currency || "usd").toLowerCase();
  const invoiceUrl = order.invoiceUrl || order.invoice_url;

  const invoice: any = {
    id: String(order.id),
    createdAt: String(createdAt),
    productName: String(order.productName || order.product?.name || order.product_name || "Subscription"),
    amount: isNaN(amount) ? 0 : amount,
    currency: currency,
    status: mapOrderStatus(order.status),
  };

  if (invoiceUrl && invoiceUrl !== "undefined") {
    invoice.invoiceUrl = String(invoiceUrl);
  }

  return invoice;
}

// Map Polar order status to UI-friendly status
function mapOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    succeeded: "completed",
    completed: "completed",
    paid: "completed",
    pending: "pending",
    failed: "failed",
    refunded: "refunded",
  };
  return statusMap[status?.toLowerCase()] || status || "completed";
}

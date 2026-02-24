export const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    billingPeriod: undefined,
    description: "Get started with our free plan",
    features: [
      "Up to 3 organizations",
      "Up to 5 team members per organization",
      "Basic activity logging",
      "Community support",
    ],
    cta: "Current Plan",
  },
  pro: {
    name: "Premium",
    price: "$20",
    billingPeriod: "/month",
    description: "Perfect for growing teams",
    features: [
      "Unlimited organizations",
      "Unlimited team members",
      "Advanced activity logging",
      "Priority email support",
      "Team analytics",
      "API access",
    ],
    cta: "Upgrade to Pro",
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    billingPeriod: undefined,
    description: "For large-scale deployments",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Advanced security features",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
  },
};

export type PlanType = keyof typeof PLANS;

export function getPlan(plan: string): (typeof PLANS)[PlanType] | null {
  return PLANS[plan as PlanType] || null;
}

import Stripe from "stripe";

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

export const stripe = stripeEnabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string)
  : null;

/**
 * Demo billing mode (upgrade/cancel without payment) must be an explicit,
 * conscious choice in production: it only activates when Stripe is NOT
 * configured AND either we're not in production or ALLOW_DEMO_BILLING=true.
 * Otherwise billing endpoints fail closed (503) rather than silently
 * giving Premium away.
 */
export function demoBillingAllowed(): boolean {
  if (stripeEnabled) return false;
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_DEMO_BILLING === "true"
  );
}

/** Absolute base URL of the app for redirects, across hosts. */
export function appUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL;
  return "http://localhost:3000";
}

export const PLANS = {
  monthly: {
    label: "Monthly",
    priceEnv: "STRIPE_PRICE_MONTHLY",
    display: "$6.99/month",
  },
  yearly: {
    label: "Yearly",
    priceEnv: "STRIPE_PRICE_YEARLY",
    display: "$59/year",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function priceIdFor(plan: PlanKey): string | undefined {
  return process.env[PLANS[plan].priceEnv];
}

export function planFromPriceId(priceId: string | undefined): PlanKey | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_YEARLY) return "yearly";
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  return null;
}

/**
 * Read the subscription period end robustly across Stripe API versions:
 * pre-Basil it lives on the subscription, from 2025-03-31 (Basil) onward it
 * lives on each subscription item.
 */
export function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const anySub = sub as unknown as {
    current_period_end?: number;
    items?: { data?: Array<{ current_period_end?: number }> };
  };
  const ts = anySub.current_period_end ?? anySub.items?.data?.[0]?.current_period_end;
  return typeof ts === "number" ? new Date(ts * 1000) : null;
}

export function subscriptionPriceId(sub: Stripe.Subscription): string | undefined {
  return sub.items?.data?.[0]?.price?.id;
}

/** Map Stripe subscription statuses to our three app-level states. */
export function appStatusFor(stripeStatus: Stripe.Subscription.Status): string {
  if (stripeStatus === "active" || stripeStatus === "trialing") return "active";
  if (stripeStatus === "past_due") return "past_due";
  return "canceled";
}

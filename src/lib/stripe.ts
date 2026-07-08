import Stripe from "stripe";

/**
 * Stripe is optional in local development. When STRIPE_SECRET_KEY is unset the
 * app runs in "demo billing" mode: the upgrade flow flips the user's
 * subscription status directly instead of going through Stripe Checkout.
 */
export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

export const stripe = stripeEnabled
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string)
  : null;

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

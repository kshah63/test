import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscribed } from "@/lib/activities";
import {
  stripe,
  stripeEnabled,
  demoBillingAllowed,
  appUrl,
  priceIdFor,
  PLANS,
  type PlanKey,
} from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

/**
 * Start a subscription. With Stripe configured this creates a Checkout
 * Session. Without Stripe keys, demo billing mode (explicitly enabled)
 * activates the subscription directly; otherwise the endpoint fails closed.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const plan: PlanKey = parsed.data.plan;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (isSubscribed(user)) {
    return NextResponse.json(
      { error: "You already have an active subscription. Manage it from the account page." },
      { status: 409 }
    );
  }

  if (!stripeEnabled || !stripe) {
    if (!demoBillingAllowed()) {
      return NextResponse.json(
        { error: "Billing is not configured. Set the Stripe environment variables." },
        { status: 503 }
      );
    }
    // Demo billing mode — explicitly enabled, no payment collected.
    const periodEnd = new Date();
    if (plan === "yearly") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "active",
        plan,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        subscriptionId: `demo_${plan}_${Date.now()}`,
      },
    });
    return NextResponse.json({ url: `${appUrl()}/account?upgraded=1`, demo: true });
  }

  const priceId = priceIdFor(plan);
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing price id for ${PLANS[plan].label} plan (${PLANS[plan].priceEnv})` },
      { status: 500 }
    );
  }

  // Reuse the Stripe customer if we have one.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { metadata: { userId: user.id, plan } },
    metadata: { userId: user.id, plan },
    // session_id lets the account page reconcile immediately on return,
    // so provisioning doesn't depend solely on webhook delivery.
    success_url: `${appUrl()}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/account?canceled=1`,
  });

  return NextResponse.json({ url: checkout.url });
}

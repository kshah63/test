import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled, priceIdFor, PLANS, type PlanKey } from "@/lib/stripe";

const checkoutSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});

/**
 * Start a subscription. With Stripe configured this creates a Checkout
 * Session and returns its URL. Without Stripe keys (local development) it
 * activates the subscription directly — demo billing mode.
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

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!stripeEnabled || !stripe) {
    // Demo billing mode — no Stripe keys configured.
    const periodEnd = new Date();
    if (plan === "yearly") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "active",
        plan,
        currentPeriodEnd: periodEnd,
        subscriptionId: `demo_${plan}_${Date.now()}`,
      },
    });
    return NextResponse.json({ url: `${appUrl}/account?upgraded=1`, demo: true });
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
    success_url: `${appUrl}/account?upgraded=1`,
    cancel_url: `${appUrl}/account?canceled=1`,
  });

  return NextResponse.json({ url: checkout.url });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled, demoBillingAllowed, appUrl } from "@/lib/stripe";

/**
 * Manage/cancel the subscription. Demo subscriptions are always canceled
 * directly in the database (even after real Stripe keys are added — they
 * don't exist in Stripe, so the portal can't manage them). Real
 * subscriptions go to the Stripe billing portal.
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isDemoSub = Boolean(user.subscriptionId?.startsWith("demo_"));

  if (isDemoSub) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "canceled",
        subscriptionId: null,
        plan: null,
        cancelAtPeriodEnd: false,
      },
    });
    return NextResponse.json({ url: `${appUrl()}/account?canceled_sub=1`, demo: true });
  }

  if (!stripeEnabled || !stripe) {
    if (!demoBillingAllowed()) {
      return NextResponse.json(
        { error: "Billing is not configured. Set the Stripe environment variables." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "No subscription to manage" }, { status: 400 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account" }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl()}/account`,
  });
  return NextResponse.json({ url: portal.url });
}

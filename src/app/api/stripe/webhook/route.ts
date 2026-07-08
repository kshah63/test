import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Stripe webhook: keeps subscription status in sync.
 * Configure the endpoint in the Stripe dashboard to send:
 *   checkout.session.completed
 *   customer.subscription.updated
 *   customer.subscription.deleted
 */
export async function POST(req: Request) {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionId: sub.id,
            subscriptionStatus: "active",
            plan: plan ?? null,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        const status =
          sub.status === "active" || sub.status === "trialing"
            ? "active"
            : sub.status === "past_due"
              ? "past_due"
              : "canceled";
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { subscriptionStatus: "canceled", subscriptionId: null, plan: null },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

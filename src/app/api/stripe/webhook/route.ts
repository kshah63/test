import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  stripe,
  stripeEnabled,
  appStatusFor,
  planFromPriceId,
  subscriptionPeriodEnd,
  subscriptionPriceId,
} from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Stripe webhook: keeps subscription status in sync.
 * Configure the endpoint in the Stripe dashboard to send:
 *   checkout.session.completed
 *   customer.subscription.updated
 *   customer.subscription.deleted
 * (The account page also reconciles the checkout session on return, so
 * initial provisioning does not depend solely on this endpoint.)
 */

async function userForSubscription(sub: Stripe.Subscription) {
  const byMeta = sub.metadata?.userId
    ? await prisma.user.findUnique({ where: { id: sub.metadata.userId } })
    : null;
  if (byMeta) return byMeta;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (customerId) {
    return prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  }
  return null;
}

async function applySubscriptionState(userId: string, sub: Stripe.Subscription) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionId: sub.id,
      subscriptionStatus: appStatusFor(sub.status),
      plan: planFromPriceId(subscriptionPriceId(sub)),
      currentPeriodEnd: subscriptionPeriodEnd(sub),
      cancelAtPeriodEnd: Boolean(sub.cancel_at_period_end),
    },
  });
}

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;
        if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") break;
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = session.metadata?.userId ?? sub.metadata?.userId;
        if (userId) await applySubscriptionState(userId, sub);
        else console.error(`webhook: no userId on checkout session ${session.id}`);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await userForSubscription(sub);
        if (!user) {
          console.error(`webhook: no user for subscription ${sub.id}`);
          break;
        }
        // Ignore events from a stale/replaced subscription (out-of-order or
        // duplicate-subscription scenarios must not clobber the current one).
        if (user.subscriptionId && user.subscriptionId !== sub.id) break;
        await applySubscriptionState(user.id, sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await userForSubscription(sub);
        if (!user) break;
        if (user.subscriptionId && user.subscriptionId !== sub.id) break;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: "canceled",
            subscriptionId: null,
            plan: null,
            cancelAtPeriodEnd: false,
          },
        });
        break;
      }
    }
  } catch (err) {
    console.error(`webhook: error handling ${event.type}`, err);
    // Non-2xx makes Stripe retry with backoff — desirable for transient DB errors.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

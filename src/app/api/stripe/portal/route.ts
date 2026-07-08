import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, stripeEnabled } from "@/lib/stripe";

/**
 * Manage/cancel the subscription. With Stripe configured this opens the
 * Stripe billing portal. In demo billing mode it cancels directly.
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

  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!stripeEnabled || !stripe) {
    // Demo billing mode: cancel immediately.
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: "canceled", subscriptionId: null, plan: null },
    });
    return NextResponse.json({ url: `${appUrl}/account?canceled_sub=1`, demo: true });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account" }, { status: 400 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/account`,
  });
  return NextResponse.json({ url: portal.url });
}

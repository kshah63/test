import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import { UpgradeButton, ManageBillingButton } from "@/components/BillingButtons";
import { ageInMonths, ageLabel } from "@/lib/age";
import { isSubscribed } from "@/lib/activities";
import { todayKey } from "@/lib/dates";
import {
  stripe,
  stripeEnabled,
  demoBillingAllowed,
  appStatusFor,
  planFromPriceId,
  subscriptionPeriodEnd,
  subscriptionPriceId,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Reconcile a completed Stripe Checkout session on return. This provisions
 * Premium immediately even if the webhook is delayed or misconfigured —
 * the webhook remains the source of truth for later lifecycle events.
 */
async function reconcileCheckoutSession(userId: string, sessionId: string) {
  if (!stripe) return false;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (
      session.metadata?.userId !== userId ||
      session.mode !== "subscription" ||
      !session.subscription ||
      (session.payment_status !== "paid" && session.payment_status !== "no_payment_required")
    ) {
      return false;
    }
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
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
    return true;
  } catch (err) {
    console.error("account: checkout reconciliation failed", err);
    return false;
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: {
    upgraded?: string;
    canceled?: string;
    canceled_sub?: string;
    session_id?: string;
  };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let justUpgraded = Boolean(searchParams.upgraded);
  if (searchParams.session_id && stripeEnabled) {
    justUpgraded = (await reconcileCheckoutSession(session.user.id, searchParams.session_id)) || justUpgraded;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) redirect("/login");
  const subscribed = isSubscribed(user);
  const isDemoSub = Boolean(user.subscriptionId?.startsWith("demo_"));
  const billingAvailable = stripeEnabled || demoBillingAllowed();
  const today = todayKey();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Account</h1>
        <p className="mt-1 text-ink/70">
          {user.name} · {user.email}
        </p>

        {justUpgraded && subscribed && (
          <div className="mt-4 rounded-xl border border-sage bg-sage/20 px-4 py-3 text-sm text-deepsage">
            🎉 Welcome to Premium! All activities are now unlocked.
          </div>
        )}
        {searchParams.canceled && (
          <div className="mt-4 rounded-xl border border-peach bg-blush/50 px-4 py-3 text-sm">
            Checkout was canceled — no charge was made.
          </div>
        )}
        {searchParams.canceled_sub && (
          <div className="mt-4 rounded-xl border border-peach bg-blush/50 px-4 py-3 text-sm">
            Your subscription has been canceled. You&apos;re back on the free plan.
          </div>
        )}

        {/* Subscription */}
        <section className="mt-8 rounded-2xl border border-peach/50 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Subscription</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                subscribed ? "bg-sage/40 text-deepsage" : "bg-ink/10 text-ink/70"
              }`}
            >
              {subscribed ? `Premium · ${user.plan ?? "monthly"}` : "Free plan"}
            </span>
          </div>

          {subscribed ? (
            <div className="mt-4">
              <p className="text-sm text-ink/80">
                You have full access to every activity, all three daily picks, and
                unlimited child profiles.
                {user.currentPeriodEnd && (
                  <>
                    {" "}
                    {user.cancelAtPeriodEnd
                      ? "Your subscription is set to cancel on "
                      : "Current period ends "}
                    {user.currentPeriodEnd.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    .
                  </>
                )}
              </p>
              <div className="mt-4">
                <ManageBillingButton demo={isDemoSub} />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-ink/80">
                The free plan includes a featured activity every day, the everyday
                activity library, and one child profile. Premium unlocks everything:
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/80">
                <li>✓ All 3 daily picks, every day</li>
                <li>✓ Premium-only activities across every age band</li>
                <li>✓ Unlimited child profiles</li>
              </ul>
              {!billingAvailable ? (
                <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Upgrades aren&apos;t available yet — billing hasn&apos;t been configured
                  on this deployment.
                </p>
              ) : (
                <>
                  {!stripeEnabled && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Demo billing mode is on: upgrading is instant and free, no card
                      required. Configure Stripe keys for real payments.
                    </p>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-peach/60 p-4">
                      <p className="font-display text-xl font-bold">
                        $6.99<span className="text-sm font-normal text-ink/60">/month</span>
                      </p>
                      <div className="mt-3">
                        <UpgradeButton plan="monthly" label="Go Premium monthly" />
                      </div>
                    </div>
                    <div className="relative rounded-xl border-2 border-terracotta p-4">
                      <span className="absolute -top-2.5 left-4 rounded-full bg-terracotta px-2 py-0.5 text-[10px] font-bold text-white">
                        SAVE 30%
                      </span>
                      <p className="font-display text-xl font-bold">
                        $59<span className="text-sm font-normal text-ink/60">/year</span>
                      </p>
                      <div className="mt-3">
                        <UpgradeButton plan="yearly" label="Go Premium yearly" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Children */}
        <section className="mt-6 rounded-2xl border border-peach/50 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Children</h2>
            {(subscribed || user.children.length === 0) && (
              <Link
                href="/onboarding"
                className="rounded-lg border border-peach px-3 py-1.5 text-sm font-medium hover:bg-blush"
              >
                + Add child
              </Link>
            )}
          </div>
          <ul className="mt-4 divide-y divide-peach/30">
            {user.children.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-ink/60">
                    {ageLabel(ageInMonths(c.birthDate, today))} old
                  </p>
                </div>
                <Link
                  href={`/dashboard?child=${c.id}`}
                  className="text-sm text-terracotta hover:underline"
                >
                  View today →
                </Link>
              </li>
            ))}
          </ul>
          {!subscribed && user.children.length >= 1 && (
            <p className="mt-2 text-xs text-ink/60">
              The free plan includes one child profile — Premium is unlimited.
            </p>
          )}
        </section>
      </main>
    </>
  );
}

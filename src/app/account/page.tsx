import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import { UpgradeButton, ManageBillingButton } from "@/components/BillingButtons";
import { ageInMonths, ageLabel } from "@/lib/age";
import { isSubscribed } from "@/lib/activities";
import { stripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { upgraded?: string; canceled_sub?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) redirect("/login");
  const subscribed = isSubscribed(user);
  const isDemoSub = Boolean(user.subscriptionId?.startsWith("demo_"));

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Account</h1>
        <p className="mt-1 text-ink/60">
          {user.name} · {user.email}
        </p>

        {searchParams.upgraded && (
          <div className="mt-4 rounded-xl border border-sage bg-sage/20 px-4 py-3 text-sm text-deepsage">
            🎉 Welcome to Premium! All activities are now unlocked.
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
                subscribed ? "bg-sage/40 text-deepsage" : "bg-ink/10 text-ink/60"
              }`}
            >
              {subscribed ? `Premium · ${user.plan ?? "monthly"}` : "Free plan"}
            </span>
          </div>

          {subscribed ? (
            <div className="mt-4">
              <p className="text-sm text-ink/70">
                You have full access to every activity, all three daily picks, and
                unlimited child profiles.
                {user.currentPeriodEnd && (
                  <>
                    {" "}
                    Current period ends{" "}
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
                <ManageBillingButton demo={isDemoSub || !stripeEnabled} />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-ink/70">
                The free plan includes one featured activity per day and one child
                profile. Premium unlocks everything:
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/70">
                <li>✓ All 3 daily activities, every day</li>
                <li>✓ Full library across every age band</li>
                <li>✓ Premium-only activities</li>
                <li>✓ Unlimited child profiles</li>
              </ul>
              {!stripeEnabled && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Demo billing mode: Stripe keys aren&apos;t configured, so upgrading is
                  instant and free. Add Stripe keys in <code>.env</code> for real payments.
                </p>
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-peach/60 p-4">
                  <p className="font-display text-xl font-bold">
                    $6.99<span className="text-sm font-normal text-ink/50">/month</span>
                  </p>
                  <div className="mt-3">
                    <UpgradeButton plan="monthly" label="Go Premium monthly" />
                  </div>
                </div>
                <div className="relative rounded-xl border-2 border-coral p-4">
                  <span className="absolute -top-2.5 left-4 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white">
                    SAVE 30%
                  </span>
                  <p className="font-display text-xl font-bold">
                    $59<span className="text-sm font-normal text-ink/50">/year</span>
                  </p>
                  <div className="mt-3">
                    <UpgradeButton plan="yearly" label="Go Premium yearly" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Children */}
        <section className="mt-6 rounded-2xl border border-peach/50 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Children</h2>
            <Link
              href="/onboarding"
              className="rounded-lg border border-peach px-3 py-1.5 text-sm font-medium hover:bg-blush"
            >
              + Add child
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-peach/30">
            {user.children.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-ink/50">
                    {ageLabel(ageInMonths(c.birthDate))} old
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
            <p className="mt-2 text-xs text-ink/50">
              The free plan includes one child profile — Premium is unlimited.
            </p>
          )}
        </section>
      </main>
    </>
  );
}

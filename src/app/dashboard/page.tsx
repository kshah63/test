import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import ActivityCard from "@/components/ActivityCard";
import WeekTracker from "@/components/WeekTracker";
import { ageInMonths, ageLabel } from "@/lib/age";
import { dailyActivitiesFor, isSubscribed } from "@/lib/activities";
import { todayKey, userTimeZone, weekDays } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { child?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) redirect("/login");
  if (user.children.length === 0) redirect("/onboarding");

  const child =
    user.children.find((c) => c.id === searchParams.child) ?? user.children[0];
  const today = todayKey();
  const months = ageInMonths(child.birthDate, today);
  const subscribed = isSubscribed(user);

  const picks = await dailyActivitiesFor(months, today);
  const week = weekDays(today);
  const todayIndex = week.findIndex((d) => d.getTime() === today.getTime());

  const [todayCompletions, weekCompletions] = await Promise.all([
    prisma.activityCompletion.findMany({
      where: { childId: child.id, completedOn: today },
      select: { activityId: true },
    }),
    prisma.activityCompletion.findMany({
      where: {
        childId: child.id,
        completedOn: { gte: week[0], lte: week[6] },
      },
      select: { completedOn: true },
    }),
  ]);
  const doneToday = new Set(todayCompletions.map((c) => c.activityId));
  const weekCounts = week.map(
    (d) => weekCompletions.filter((c) => c.completedOn.getTime() === d.getTime()).length
  );

  const dateLabel = new Date().toLocaleDateString("en-US", {
    timeZone: userTimeZone(),
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hasLockedPicks = !subscribed && picks.some((p) => p.isPremium);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Child switcher */}
        {user.children.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {user.children.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard?child=${c.id}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  c.id === child.id
                    ? "bg-terracotta text-white"
                    : "border border-peach bg-white hover:bg-blush"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ink/60">{dateLabel}</p>
            <h1 className="font-display text-3xl font-bold">
              Today with {child.name}
            </h1>
            <p className="mt-1 text-ink/70">
              {ageLabel(months)} old · activities matched to this stage
            </p>
          </div>
          <div className="rounded-2xl border border-peach/50 bg-white px-5 py-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/60">
              This week
            </p>
            <WeekTracker days={weekCounts} todayIndex={todayIndex} />
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">
              Today&apos;s 10-minute activities
            </h2>
            {hasLockedPicks && (
              <Link href="/account" className="text-sm font-medium text-terracotta hover:underline">
                Unlock all 3 →
              </Link>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                childId={child.id}
                completed={doneToday.has(activity.id)}
                locked={!subscribed && activity.isPremium}
              />
            ))}
          </div>
          {picks.length === 0 && (
            <p className="rounded-2xl border border-peach/50 bg-white p-6 text-ink/70">
              No activities found for this age yet — check the{" "}
              <Link href="/activities" className="text-terracotta underline">
                library
              </Link>
              .
            </p>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-peach/50 bg-blush/40 p-6">
          <h3 className="font-display font-semibold">💡 Why 10 minutes matters</h3>
          <p className="mt-1 text-sm text-ink/80">
            In the first years of life, more than a million new neural connections form
            every second — and they&apos;re strengthened most by short, warm, back-and-forth
            interactions with you. Ten focused minutes a day beats an hour of distracted time.
          </p>
        </section>
      </main>
    </>
  );
}

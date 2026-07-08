import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import WeekTracker from "@/components/WeekTracker";
import { CATEGORIES, ageInMonths, ageLabel } from "@/lib/age";
import { todayKey, weekDays } from "@/lib/dates";

export const dynamic = "force-dynamic";

function computeStreak(daysWithActivity: Set<number>, today: Date): number {
  // Streak of consecutive days with ≥1 completion, ending today or yesterday.
  let streak = 0;
  let cursor = today.getTime();
  if (!daysWithActivity.has(cursor)) cursor -= 86_400_000; // today not done yet — count from yesterday
  while (daysWithActivity.has(cursor)) {
    streak++;
    cursor -= 86_400_000;
  }
  return streak;
}

export default async function ProgressPage({
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

  const week = weekDays(today);
  const todayIndex = week.findIndex((d) => d.getTime() === today.getTime());

  const [weekCompletions, activeDays, totalCount] = await Promise.all([
    prisma.activityCompletion.findMany({
      where: { childId: child.id, completedOn: { gte: week[0], lte: week[6] } },
      include: { activity: true },
      orderBy: { completedOn: "desc" },
    }),
    // Distinct days only — enough for the streak without loading every row.
    prisma.activityCompletion.findMany({
      where: { childId: child.id },
      select: { completedOn: true },
      distinct: ["completedOn"],
    }),
    prisma.activityCompletion.count({ where: { childId: child.id } }),
  ]);

  const weekCounts = week.map(
    (d) => weekCompletions.filter((c) => c.completedOn.getTime() === d.getTime()).length
  );
  const activeDaysThisWeek = weekCounts.filter((c) => c > 0).length;
  const daysWithActivity = new Set(activeDays.map((c) => c.completedOn.getTime()));
  const streak = computeStreak(daysWithActivity, today);

  // Category mix this week.
  const catCounts = new Map<string, number>();
  for (const c of weekCompletions) {
    catCounts.set(c.activity.category, (catCounts.get(c.activity.category) ?? 0) + 1);
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Child switcher */}
        {user.children.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {user.children.map((c) => (
              <Link
                key={c.id}
                href={`/progress?child=${c.id}`}
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

        <h1 className="font-display text-3xl font-bold">
          {child.name}&apos;s week
        </h1>
        <p className="mt-1 text-ink/70">{ageLabel(months)} old</p>

        {/* Stat tiles */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-peach/50 bg-white p-5 text-center">
            <p className="font-display text-3xl font-bold text-terracotta">{streak}</p>
            <p className="mt-1 text-xs text-ink/70">day streak 🔥</p>
          </div>
          <div className="rounded-2xl border border-peach/50 bg-white p-5 text-center">
            <p className="font-display text-3xl font-bold text-terracotta">
              {activeDaysThisWeek}<span className="text-lg text-ink/40">/7</span>
            </p>
            <p className="mt-1 text-xs text-ink/70">active days this week</p>
          </div>
          <div className="rounded-2xl border border-peach/50 bg-white p-5 text-center">
            <p className="font-display text-3xl font-bold text-terracotta">{totalCount}</p>
            <p className="mt-1 text-xs text-ink/70">activities all-time</p>
          </div>
        </div>

        {/* Week grid */}
        <div className="mt-6 rounded-2xl border border-peach/50 bg-white p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">This week</h2>
          <WeekTracker days={weekCounts} todayIndex={todayIndex} />
        </div>

        {/* Category mix */}
        {catCounts.size > 0 && (
          <div className="mt-6 rounded-2xl border border-peach/50 bg-white p-6">
            <h2 className="mb-3 font-display text-lg font-semibold">Skill mix this week</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(catCounts.entries()).map(([key, count]) => {
                const cat = CATEGORIES[key] ?? CATEGORIES.cognitive;
                return (
                  <span
                    key={key}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${cat.color}`}
                  >
                    {cat.emoji} {cat.label} × {count}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* This week's log */}
        <div className="mt-6 rounded-2xl border border-peach/50 bg-white p-6">
          <h2 className="mb-3 font-display text-lg font-semibold">Completed this week</h2>
          {weekCompletions.length === 0 ? (
            <p className="text-sm text-ink/70">
              Nothing yet this week —{" "}
              <Link href="/dashboard" className="text-terracotta underline">
                today&apos;s activities
              </Link>{" "}
              are ready when you are.
            </p>
          ) : (
            <ul className="divide-y divide-peach/30">
              {weekCompletions.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2.5">
                  <Link
                    href={`/activities/${c.activity.slug}?child=${child.id}`}
                    className="text-sm font-medium hover:text-terracotta"
                  >
                    {c.activity.title}
                  </Link>
                  <span className="text-xs text-ink/60">
                    {c.completedOn.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}

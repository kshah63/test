import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import CompleteButton from "@/components/CompleteButton";
import { CATEGORIES, ageLabel } from "@/lib/age";
import { dayKey, isSubscribed } from "@/lib/activities";

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { child?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [user, activity] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { children: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.activity.findUnique({ where: { slug: params.slug } }),
  ]);
  if (!user) redirect("/login");
  if (!activity) notFound();

  const subscribed = isSubscribed(user);
  const child =
    user.children.find((c) => c.id === searchParams.child) ?? user.children[0];
  const cat = CATEGORIES[activity.category] ?? CATEGORIES.cognitive;

  if (activity.isPremium && !subscribed) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-peach/50 bg-white p-10">
            <div className="text-4xl">🔒</div>
            <h1 className="mt-4 font-display text-2xl font-bold">{activity.title}</h1>
            <p className="mt-2 text-ink/60">
              This is a Premium activity. Upgrade to unlock the full library —
              every activity, every age, all three daily picks.
            </p>
            <Link
              href="/account"
              className="mt-6 inline-block rounded-xl bg-coral px-6 py-2.5 font-semibold text-white hover:bg-terracotta"
            >
              See Premium plans
            </Link>
          </div>
        </main>
      </>
    );
  }

  const steps: string[] = JSON.parse(activity.steps);
  const materials: string[] = JSON.parse(activity.materials);

  const completedToday = child
    ? await prisma.activityCompletion.findUnique({
        where: {
          childId_activityId_completedOn: {
            childId: child.id,
            activityId: activity.id,
            completedOn: dayKey(),
          },
        },
      })
    : null;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/activities" className="text-sm text-ink/50 hover:text-terracotta">
          ← Activity library
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
            {cat.emoji} {cat.label}
          </span>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-ink/60 border border-peach/50">
            {ageLabel(activity.ageMinMonths)} – {ageLabel(activity.ageMaxMonths)}
          </span>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-ink/60 border border-peach/50">
            ⏱ about {activity.durationMin} minutes
          </span>
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold">{activity.title}</h1>
        <p className="mt-2 text-lg text-ink/70">{activity.summary}</p>

        <div className="mt-6 rounded-2xl border border-sage/60 bg-sage/15 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-deepsage">
            🧠 What this builds
          </h2>
          <p className="mt-1.5 text-sm text-ink/80">{activity.benefit}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-peach/50 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            You&apos;ll need
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {materials.map((m) => (
              <li key={m} className="rounded-full bg-blush px-3 py-1 text-sm">
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-peach/50 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            How to play
          </h2>
          <ol className="mt-3 space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-coral text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-sm text-ink/80">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        {child && (
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-peach/50 bg-white p-5">
            <p className="text-sm text-ink/70">
              Did this with <span className="font-semibold">{child.name}</span> today?
            </p>
            <CompleteButton
              childId={child.id}
              activityId={activity.id}
              initialCompleted={Boolean(completedToday)}
            />
          </div>
        )}
      </main>
    </>
  );
}

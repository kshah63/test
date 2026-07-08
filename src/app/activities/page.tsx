import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import ActivityCard from "@/components/ActivityCard";
import { AGE_BANDS, CATEGORIES, ageInMonths } from "@/lib/age";
import { isSubscribed } from "@/lib/activities";
import { todayKey } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: { band?: string; category?: string; child?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) redirect("/login");
  const subscribed = isSubscribed(user);
  const child =
    user.children.find((c) => c.id === searchParams.child) ?? user.children[0];

  const today = todayKey();

  // Default the age filter to the selected child's band.
  const childMonths = child ? ageInMonths(child.birthDate, today) : null;
  const defaultBand =
    childMonths === null
      ? undefined
      : AGE_BANDS.find((b) => childMonths >= b.min && childMonths < b.max)?.label;
  const bandLabel = searchParams.band === "all" ? undefined : (searchParams.band ?? defaultBand);
  const band = AGE_BANDS.find((b) => b.label === bandLabel);
  const category = searchParams.category;

  const activities = await prisma.activity.findMany({
    where: {
      ...(band
        ? { ageMinMonths: { lt: band.max }, ageMaxMonths: { gt: band.min } }
        : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ ageMinMonths: "asc" }, { title: "asc" }],
  });

  // Which of these has the selected child already done today?
  const doneToday = child
    ? new Set(
        (
          await prisma.activityCompletion.findMany({
            where: { childId: child.id, completedOn: today },
            select: { activityId: true },
          })
        ).map((c) => c.activityId)
      )
    : new Set<string>();

  const linkFor = (nextBand?: string, nextCat?: string) => {
    const params = new URLSearchParams();
    params.set("band", nextBand ?? "all");
    if (nextCat) params.set("category", nextCat);
    if (child) params.set("child", child.id);
    return `/activities?${params.toString()}`;
  };
  const currentBandParam = band?.label ?? "all";

  const childLink = (childId: string) => {
    const params = new URLSearchParams();
    if (searchParams.band) params.set("band", searchParams.band);
    if (category) params.set("category", category);
    params.set("child", childId);
    return `/activities?${params.toString()}`;
  };

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Activity library</h1>
        <p className="mt-1 text-ink/70">
          Every activity takes about 10 minutes with things you have at home.
        </p>

        {/* Child switcher — completions are logged for the selected child */}
        {user.children.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink/60">Playing with:</span>
            {user.children.map((c) => (
              <Link
                key={c.id}
                href={childLink(c.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  c.id === child?.id
                    ? "bg-terracotta text-white"
                    : "border border-peach bg-white hover:bg-blush"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Age filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={linkFor("all", category)}
            className={`rounded-full px-3.5 py-1.5 text-sm ${
              !band ? "bg-ink text-white" : "border border-peach bg-white hover:bg-blush"
            }`}
          >
            All ages
          </Link>
          {AGE_BANDS.map((b) => (
            <Link
              key={b.label}
              href={linkFor(b.label, category)}
              className={`rounded-full px-3.5 py-1.5 text-sm ${
                band?.label === b.label
                  ? "bg-ink text-white"
                  : "border border-peach bg-white hover:bg-blush"
              }`}
            >
              {b.label}
            </Link>
          ))}
        </div>

        {/* Category filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={linkFor(currentBandParam)}
            className={`rounded-full px-3.5 py-1.5 text-sm ${
              !category ? "bg-ink text-white" : "border border-peach bg-white hover:bg-blush"
            }`}
          >
            All skills
          </Link>
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <Link
              key={key}
              href={linkFor(currentBandParam, key)}
              className={`rounded-full px-3.5 py-1.5 text-sm ${
                category === key
                  ? "bg-ink text-white"
                  : "border border-peach bg-white hover:bg-blush"
              }`}
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <ActivityCard
              key={a.id}
              activity={a}
              childId={child?.id}
              completed={doneToday.has(a.id)}
              locked={a.isPremium && !subscribed}
            />
          ))}
        </div>
        {activities.length === 0 && (
          <p className="mt-8 rounded-2xl border border-peach/50 bg-white p-6 text-ink/70">
            No activities match those filters yet.
          </p>
        )}
      </main>
    </>
  );
}

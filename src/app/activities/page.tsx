import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/Nav";
import ActivityCard from "@/components/ActivityCard";
import { AGE_BANDS, CATEGORIES, ageInMonths } from "@/lib/age";
import { isSubscribed } from "@/lib/activities";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: { band?: string; category?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: { orderBy: { createdAt: "asc" } } },
  });
  if (!user) redirect("/login");
  const subscribed = isSubscribed(user);
  const child = user.children[0];

  // Default the age filter to the first child's band.
  const childMonths = child ? ageInMonths(child.birthDate) : null;
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

  const linkFor = (nextBand?: string, nextCat?: string) => {
    const params = new URLSearchParams();
    params.set("band", nextBand ?? "all");
    if (nextCat) params.set("category", nextCat);
    return `/activities?${params.toString()}`;
  };
  const currentBandParam = band?.label ?? "all";

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Activity library</h1>
        <p className="mt-1 text-ink/60">
          Every activity takes about 10 minutes with things you have at home.
        </p>

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
              locked={a.isPremium && !subscribed}
            />
          ))}
        </div>
        {activities.length === 0 && (
          <p className="mt-8 rounded-2xl border border-peach/50 bg-white p-6 text-ink/60">
            No activities match those filters yet.
          </p>
        )}
      </main>
    </>
  );
}

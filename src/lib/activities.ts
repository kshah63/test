import { prisma } from "@/lib/prisma";
import type { Activity } from "@prisma/client";
import { dayOfYear } from "@/lib/dates";

/** Number of activities suggested per day. */
export const DAILY_COUNT = 3;

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Deterministic daily picks for a child's age: rank the age-appropriate pool
 * by a per-day hash and take the top picks, so suggestions change every day
 * (including across year boundaries) but stay stable within a day.
 * Free users can always use a non-premium pick, so when the pool has one we
 * guarantee at least one non-premium pick, ordered first (the "featured" pick).
 */
export async function dailyActivitiesFor(
  ageMonths: number,
  dayKey: Date
): Promise<Activity[]> {
  const pool = await prisma.activity.findMany({
    where: { ageMinMonths: { lte: ageMonths }, ageMaxMonths: { gte: ageMonths } },
    orderBy: { slug: "asc" },
  });
  if (pool.length === 0) return [];

  const seed = dayKey.getUTCFullYear() * 379 + dayOfYear(dayKey);
  const ranked = [...pool].sort(
    (a, b) => hashStr(`${seed}:${a.slug}`) - hashStr(`${seed}:${b.slug}`)
  );
  const picks = ranked.slice(0, Math.min(DAILY_COUNT, ranked.length));

  if (!picks.some((p) => !p.isPremium)) {
    const nonPremium = ranked.find((p) => !p.isPremium);
    if (nonPremium) picks[picks.length - 1] = nonPremium;
  }
  // Non-premium first so free users' usable pick leads the list.
  picks.sort((a, b) => Number(a.isPremium) - Number(b.isPremium));
  return picks;
}

export function isSubscribed(user: {
  subscriptionStatus: string;
  subscriptionId?: string | null;
  currentPeriodEnd?: Date | null;
}): boolean {
  const active =
    user.subscriptionStatus === "active" || user.subscriptionStatus === "past_due";
  if (!active) return false;
  // Demo subscriptions have no renewal machinery — expire them by period end.
  if (
    user.subscriptionId?.startsWith("demo_") &&
    user.currentPeriodEnd &&
    user.currentPeriodEnd.getTime() < Date.now()
  ) {
    return false;
  }
  return true;
}

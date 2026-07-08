import { prisma } from "@/lib/prisma";
import type { Activity } from "@prisma/client";

/** Number of activities suggested per day. Free users can open only the first. */
export const DAILY_COUNT = 3;

/** Normalize a date to midnight UTC — completions are stored per-day. */
export function dayKey(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  return Math.floor((d.getTime() - start) / 86_400_000);
}

/**
 * Deterministic daily picks: every activity age-appropriate for the child,
 * rotated by day-of-year so the suggestions change each day but stay stable
 * within a day (and across page refreshes).
 */
export async function dailyActivitiesFor(
  ageMonths: number,
  date: Date = new Date()
): Promise<Activity[]> {
  const pool = await prisma.activity.findMany({
    where: { ageMinMonths: { lte: ageMonths }, ageMaxMonths: { gte: ageMonths } },
    orderBy: { slug: "asc" },
  });
  if (pool.length === 0) return [];
  const offset = dayOfYear(date) % pool.length;
  const picks: Activity[] = [];
  const step = Math.max(1, Math.floor(pool.length / DAILY_COUNT));
  for (let i = 0; i < Math.min(DAILY_COUNT, pool.length); i++) {
    picks.push(pool[(offset + i * step) % pool.length]);
  }
  return picks;
}

/** Monday-start week containing `date`, as an array of 7 day-keys (UTC). */
export function weekDays(date: Date = new Date()): Date[] {
  const key = dayKey(date);
  const dow = (key.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(key.getTime() - dow * 86_400_000);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 86_400_000));
}

export function isSubscribed(user: { subscriptionStatus: string }): boolean {
  return user.subscriptionStatus === "active" || user.subscriptionStatus === "past_due";
}

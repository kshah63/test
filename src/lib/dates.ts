import { cookies } from "next/headers";

/**
 * All completions are stored as "day keys": midnight UTC of the calendar date
 * in the USER'S timezone. A tiny client component (TimezoneSync) stores the
 * browser's IANA timezone in a cookie; server code reads it here. Falls back
 * to UTC on the very first request before the cookie exists.
 */
export function userTimeZone(): string {
  try {
    const raw = cookies().get("tz")?.value;
    if (raw) {
      const tz = decodeURIComponent(raw);
      // Throws on invalid timezone strings — don't trust the cookie blindly.
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    }
  } catch {
    // fall through to UTC
  }
  return "UTC";
}

/** Midnight-UTC day key for the calendar date in `tz` at instant `at`. */
export function dayKeyInTz(tz: string, at: Date = new Date()): Date {
  // en-CA formats as YYYY-MM-DD
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Today's day key in the requesting user's timezone (server-side only). */
export function todayKey(): Date {
  return dayKeyInTz(userTimeZone());
}

/** Monday-start week containing the day key `key`, as 7 day keys. */
export function weekDays(key: Date): Date[] {
  const dow = (key.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(key.getTime() - dow * 86_400_000);
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * 86_400_000));
}

export function dayOfYear(key: Date): number {
  const start = Date.UTC(key.getUTCFullYear(), 0, 0);
  return Math.floor((key.getTime() - start) / 86_400_000);
}

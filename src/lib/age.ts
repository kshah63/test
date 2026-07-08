export function ageInMonths(birthDate: Date, now: Date = new Date()): number {
  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth()) -
    (now.getDate() < birthDate.getDate() ? 1 : 0);
  return Math.max(0, months);
}

export function ageLabel(months: number): string {
  if (months < 1) return "Newborn";
  if (months < 24) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years}y ${rem}m`;
}

export const AGE_BANDS = [
  { label: "0–3 months", min: 0, max: 3 },
  { label: "3–6 months", min: 3, max: 6 },
  { label: "6–12 months", min: 6, max: 12 },
  { label: "1–2 years", min: 12, max: 24 },
  { label: "2–3 years", min: 24, max: 36 },
  { label: "3–4 years", min: 36, max: 48 },
  { label: "4–6 years", min: 48, max: 78 },
] as const;

export const CATEGORIES: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  motor: { label: "Motor Skills", emoji: "🤸", color: "bg-peach text-ink" },
  language: { label: "Language", emoji: "💬", color: "bg-sage/40 text-deepsage" },
  sensory: { label: "Sensory", emoji: "✋", color: "bg-blush text-terracotta" },
  cognitive: { label: "Thinking", emoji: "🧠", color: "bg-amber-100 text-amber-800" },
  social: { label: "Social & Emotional", emoji: "💛", color: "bg-rose-100 text-rose-700" },
};

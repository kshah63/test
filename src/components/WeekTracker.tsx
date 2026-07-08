const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeekTracker({
  days,
  todayIndex,
}: {
  /** completion counts per weekday, Monday-first */
  days: number[];
  todayIndex: number;
}) {
  return (
    <ul className="grid grid-cols-7 gap-2" aria-label="Activities completed this week">
      {days.map((count, i) => {
        const isToday = i === todayIndex;
        const isFuture = i > todayIndex;
        const label = `${DAY_LABELS[i]}${isToday ? " (today)" : ""}: ${count} ${
          count === 1 ? "activity" : "activities"
        } completed`;
        return (
          <li key={i} className="flex flex-col items-center gap-1.5" aria-label={label}>
            <span
              aria-hidden
              className={`text-xs ${isToday ? "font-bold text-terracotta" : "text-ink/60"}`}
            >
              {DAY_LABELS[i]}
            </span>
            <div
              aria-hidden
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                count > 0
                  ? "border-deepsage bg-sage/40 text-deepsage"
                  : isFuture
                    ? "border-dashed border-ink/15 text-ink/20"
                    : isToday
                      ? "border-terracotta text-terracotta"
                      : "border-ink/15 text-ink/30"
              }`}
              title={label}
            >
              {count > 0 ? (count > 1 ? count : "✓") : isFuture ? "·" : "–"}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

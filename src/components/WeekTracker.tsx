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
    <div className="grid grid-cols-7 gap-2">
      {days.map((count, i) => {
        const isToday = i === todayIndex;
        const isFuture = i > todayIndex;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className={`text-xs ${isToday ? "font-bold text-terracotta" : "text-ink/50"}`}>
              {DAY_LABELS[i]}
            </span>
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                count > 0
                  ? "border-deepsage bg-sage/40 text-deepsage"
                  : isFuture
                    ? "border-dashed border-ink/15 text-ink/20"
                    : isToday
                      ? "border-coral text-coral"
                      : "border-ink/15 text-ink/30"
              }`}
              title={`${count} activit${count === 1 ? "y" : "ies"} completed`}
            >
              {count > 0 ? (count > 1 ? count : "✓") : isFuture ? "·" : "–"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import type { Activity } from "@prisma/client";
import { CATEGORIES } from "@/lib/age";
import CompleteButton from "@/components/CompleteButton";

export default function ActivityCard({
  activity,
  childId,
  completed,
  locked,
}: {
  activity: Activity;
  childId?: string;
  completed?: boolean;
  locked?: boolean;
}) {
  const cat = CATEGORIES[activity.category] ?? CATEGORIES.cognitive;

  if (locked) {
    return (
      <div className="relative rounded-2xl border border-peach/50 bg-white/60 p-5 opacity-90">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
            {cat.emoji} {cat.label}
          </span>
          <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-xs font-medium text-ink/70">
            🔒 Premium
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold blur-[3px] select-none">
          {activity.title}
        </h3>
        <p className="mt-1 text-sm text-ink/60 blur-[3px] select-none line-clamp-2">
          {activity.summary}
        </p>
        <Link
          href="/account"
          className="mt-3 inline-block rounded-lg bg-coral px-3 py-1.5 text-sm font-medium text-white hover:bg-terracotta"
        >
          Unlock with Premium →
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        completed
          ? "border-sage bg-sage/15"
          : "border-peach/50 bg-white hover:border-coral/60"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}>
          {cat.emoji} {cat.label}
        </span>
        <span className="text-xs text-ink/50">⏱ {activity.durationMin} min</span>
        {completed && (
          <span className="ml-auto text-xs font-medium text-deepsage">✓ Done today</span>
        )}
      </div>
      <Link href={`/activities/${activity.slug}`} className="group">
        <h3 className="font-display text-lg font-semibold group-hover:text-terracotta">
          {activity.title}
        </h3>
        <p className="mt-1 text-sm text-ink/70 line-clamp-2">{activity.summary}</p>
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <Link
          href={`/activities/${activity.slug}`}
          className="rounded-lg border border-peach px-3 py-1.5 text-sm font-medium hover:bg-blush"
        >
          How to play
        </Link>
        {childId && (
          <CompleteButton
            childId={childId}
            activityId={activity.id}
            initialCompleted={Boolean(completed)}
          />
        )}
      </div>
    </div>
  );
}

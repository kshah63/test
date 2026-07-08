"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CompleteButton({
  childId,
  activityId,
  initialCompleted,
}: {
  childId: string;
  activityId: string;
  initialCompleted: boolean;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    const res = await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, activityId }),
    });
    if (res.ok) {
      const data = await res.json();
      setCompleted(data.completed);
      startTransition(() => router.refresh());
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        completed
          ? "bg-deepsage text-white hover:bg-deepsage/80"
          : "bg-coral text-white hover:bg-terracotta"
      } disabled:opacity-60`}
    >
      {completed ? "✓ Completed" : "Mark complete"}
    </button>
  );
}

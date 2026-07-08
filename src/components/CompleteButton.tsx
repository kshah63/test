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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, activityId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't save — try again");
        return;
      }
      setCompleted(data.completed);
      startTransition(() => router.refresh());
    } catch {
      setError("Couldn't save — check your connection");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={busy || pending}
        aria-pressed={completed}
        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          completed
            ? "bg-deepsage text-white hover:bg-deepsage/80"
            : "bg-terracotta text-white hover:bg-[#a53d22]"
        } disabled:opacity-60`}
      >
        {busy ? "Saving…" : completed ? "✓ Completed" : "Mark complete"}
      </button>
      {error && <p className="mt-1.5 text-xs text-rose-700">{error}</p>}
    </div>
  );
}

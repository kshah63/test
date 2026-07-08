"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthDate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-peach/50 bg-white p-8">
          <div className="text-4xl">👶</div>
          <h1 className="mt-3 font-display text-2xl font-bold">Tell us about your little one</h1>
          <p className="mt-1 text-sm text-ink/70">
            We&apos;ll match every activity to their exact developmental stage.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="childName" className="mb-1 block text-sm font-medium">
                Child&apos;s name
              </label>
              <input
                id="childName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-peach/70 px-3 py-2 outline-none focus:border-terracotta"
                placeholder="Maya"
              />
            </div>
            <div>
              <label htmlFor="birthDate" className="mb-1 block text-sm font-medium">
                Date of birth
              </label>
              <input
                id="birthDate"
                type="date"
                required
                max={today}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-lg border border-peach/70 px-3 py-2 outline-none focus:border-terracotta"
              />
            </div>
            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-terracotta py-2.5 font-semibold text-white hover:bg-[#a53d22] disabled:opacity-60"
            >
              {loading ? "Saving…" : "See today's activities →"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

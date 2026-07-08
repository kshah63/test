"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UpgradeButton({ plan, label }: { plan: "monthly" | "yearly"; label: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function upgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not start checkout");
        return;
      }
      if (data.demo) {
        router.push("/account?upgraded=1");
        router.refresh();
      } else if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={upgrade}
        disabled={loading}
        className="w-full rounded-xl bg-terracotta py-2.5 font-semibold text-white hover:bg-[#a53d22] disabled:opacity-60"
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}

export function ManageBillingButton({ demo }: { demo: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function manage() {
    if (demo && !confirm("Cancel your Premium subscription?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not open billing");
        return;
      }
      if (data.demo) {
        router.push("/account?canceled_sub=1");
        router.refresh();
      } else if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={manage}
        disabled={loading}
        className="rounded-xl border border-peach px-4 py-2 text-sm font-medium hover:bg-blush disabled:opacity-60"
      >
        {loading ? "Opening…" : demo ? "Cancel subscription" : "Manage billing"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}

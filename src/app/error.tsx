"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-peach/50 bg-white p-8 text-center">
        <div className="text-4xl">🧸</div>
        <h1 className="mt-3 font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink/70">
          Sorry about that — it wasn&apos;t anything you did. Try again, and if it
          keeps happening, come back in a few minutes.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-terracotta px-5 py-2 font-semibold text-white hover:bg-[#a53d22]"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-peach px-5 py-2 font-semibold hover:bg-blush"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

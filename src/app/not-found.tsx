import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-peach/50 bg-white p-8 text-center">
        <div className="text-4xl">🔍</div>
        <h1 className="mt-3 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-ink/70">
          We couldn&apos;t find that page — it may have wandered off during tummy time.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-terracotta px-5 py-2 font-semibold text-white hover:bg-[#a53d22]"
        >
          Back to today&apos;s activities
        </Link>
      </div>
    </main>
  );
}

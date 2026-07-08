import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Nav from "@/components/Nav";
import { AGE_BANDS, CATEGORIES } from "@/lib/age";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4">
        {/* Hero */}
        <section className="py-16 text-center sm:py-24">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-terracotta">
            Newborn to 6 years
          </p>
          <h1 className="mx-auto max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
            10 minutes a day of brain-building play
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink/70">
            Every day, three simple activities matched to your child&apos;s exact age —
            using things you already have at home. No prep, no pressure, just
            connection and development.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-terracotta px-6 py-3 font-semibold text-white shadow-sm hover:bg-[#a53d22]"
            >
              Start free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-peach px-6 py-3 font-semibold hover:bg-blush"
            >
              Log in
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="grid gap-6 pb-16 sm:grid-cols-3">
          {[
            {
              emoji: "👶",
              title: "Tell us your child's age",
              body: "Every activity is matched to their developmental stage, from newborn tummy time to pre-reading games at six.",
            },
            {
              emoji: "⏱️",
              title: "Play for 10 minutes",
              body: "Three fresh ideas every day with step-by-step instructions and the 'why' behind each one.",
            },
            {
              emoji: "📈",
              title: "Watch the week fill up",
              body: "Tick off what you did and build a streak. Small daily moments add up to big development.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-peach/50 bg-white p-6">
              <div className="text-3xl">{f.emoji}</div>
              <h3 className="mt-3 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink/70">{f.body}</p>
            </div>
          ))}
        </section>

        {/* Coverage */}
        <section className="pb-16">
          <h2 className="text-center font-display text-2xl font-bold">
            Grows with your child
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {AGE_BANDS.map((b) => (
              <span
                key={b.label}
                className="rounded-full border border-peach bg-white px-4 py-1.5 text-sm"
              >
                {b.label}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {Object.values(CATEGORIES).map((c) => (
              <span
                key={c.label}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${c.color}`}
              >
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="pb-20">
          <h2 className="text-center font-display text-2xl font-bold">Simple pricing</h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-peach/50 bg-white p-6">
              <h3 className="font-display text-lg font-semibold">Free</h3>
              <p className="mt-1 font-display text-3xl font-bold">$0</p>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                <li>✓ A featured activity every day</li>
                <li>✓ The everyday activity library</li>
                <li>✓ Weekly progress tracking</li>
                <li>✓ One child profile</li>
              </ul>
            </div>
            <div className="relative rounded-2xl border-2 border-terracotta bg-white p-6">
              <span className="absolute -top-3 left-6 rounded-full bg-terracotta px-3 py-0.5 text-xs font-semibold text-white">
                Most popular
              </span>
              <h3 className="font-display text-lg font-semibold">Premium</h3>
              <p className="mt-1 font-display text-3xl font-bold">
                $6.99<span className="text-base font-normal text-ink/60">/mo</span>
              </p>
              <p className="text-xs text-ink/60">or $59/year — save 30%</p>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                <li>✓ All 3 daily picks, every day</li>
                <li>✓ Premium-only activities in every age band</li>
                <li>✓ Unlimited child profiles</li>
                <li>✓ Everything in Free</li>
              </ul>
              <Link
                href="/signup"
                className="mt-5 block rounded-xl bg-terracotta py-2.5 text-center font-semibold text-white hover:bg-[#a53d22]"
              >
                Start free, upgrade anytime
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-peach/40 py-8 text-center text-sm text-ink/60">
        🌱 TinySteps — little moments, big development
      </footer>
    </>
  );
}

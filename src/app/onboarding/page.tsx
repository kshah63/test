import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscribed } from "@/lib/activities";
import OnboardingForm from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { _count: { select: { children: true } } },
  });
  if (!user) redirect("/login");

  // Free plan includes one child — show the upgrade path instead of a form
  // that would only 403 on submit.
  if (user._count.children >= 1 && !isSubscribed(user)) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-peach/50 bg-white p-8 text-center">
          <div className="text-4xl">👨‍👩‍👧‍👦</div>
          <h1 className="mt-3 font-display text-2xl font-bold">
            More little ones? That&apos;s Premium
          </h1>
          <p className="mt-2 text-sm text-ink/70">
            The free plan includes one child profile. Premium gives you
            unlimited children, all three daily picks, and the full library.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-block rounded-xl bg-terracotta px-6 py-2.5 font-semibold text-white hover:bg-[#a53d22]"
          >
            See Premium plans
          </Link>
          <p className="mt-4 text-sm">
            <Link href="/dashboard" className="text-ink/60 hover:text-terracotta">
              ← Back to today&apos;s activities
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return <OnboardingForm />;
}

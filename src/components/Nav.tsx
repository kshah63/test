import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Nav() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-peach/40 bg-cream/90 backdrop-blur sticky top-0 z-10">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href={session ? "/dashboard" : "/"} className="font-display text-xl font-bold text-terracotta">
          🌱 TinySteps
        </Link>
        {session ? (
          <div className="flex items-center gap-1 sm:gap-4 text-sm">
            <Link href="/dashboard" className="rounded-lg px-2 py-1.5 hover:bg-blush">
              Today
            </Link>
            <Link href="/activities" className="rounded-lg px-2 py-1.5 hover:bg-blush">
              Activities
            </Link>
            <Link href="/progress" className="rounded-lg px-2 py-1.5 hover:bg-blush">
              Progress
            </Link>
            <Link href="/account" className="rounded-lg px-2 py-1.5 hover:bg-blush">
              Account
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-lg px-3 py-1.5 hover:bg-blush">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-coral px-3 py-1.5 font-medium text-white hover:bg-terracotta"
            >
              Get started
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg px-2 py-1.5 text-ink/60 hover:bg-blush"
    >
      Sign out
    </button>
  );
}

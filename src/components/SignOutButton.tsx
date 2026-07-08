"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="shrink-0 rounded-lg px-2 py-1.5 text-ink/70 hover:bg-blush"
    >
      Sign out
    </button>
  );
}

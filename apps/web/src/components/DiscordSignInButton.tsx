"use client";

import { signIn } from "next-auth/react";

type Props = {
  callbackUrl?: string;
};

/**
 * NextAuth v4: GET /api/auth/signin/discord with custom pages.signIn
 * redirects back to /login?error=discord instead of starting OAuth.
 * Must POST via signIn() (CSRF) to begin the Discord flow.
 */
export function DiscordSignInButton({ callbackUrl = "/dashboard" }: Props) {
  return (
    <button
      type="button"
      className="btn btn-block"
      onClick={() => signIn("discord", { callbackUrl })}
    >
      Kontynuuj z Discord
    </button>
  );
}

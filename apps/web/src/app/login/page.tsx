import { AuthChrome } from "@/components/AuthChrome";
import { DiscordSignInButton } from "@/components/DiscordSignInButton";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const FRIENDLY_ERRORS: Record<string, string> = {
  OAuthSignin: "Nie udało się rozpocząć logowania Discord.",
  OAuthCallback: "Discord odrzucił powrót (Redirect URL / NEXTAUTH_URL).",
  OAuthCreateAccount: "Nie udało się utworzyć konta w bazie.",
  Callback: "Błąd podczas finalizacji logowania.",
  Configuration: "Brak lub błędna konfiguracja NextAuth / Discord OAuth.",
  AccessDenied: "Odmowa dostępu.",
  Default: "Logowanie nie powiodło się.",
  // GET /api/auth/signin/discord with pages.signIn set — not a real OAuth failure
  discord: "Kliknij ponownie „Kontynuuj z Discord” (poprawiony start OAuth).",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;
  const errorKey = params.error;
  const errorMessage =
    errorKey &&
    (FRIENDLY_ERRORS[errorKey] ??
      `Logowanie nie powiodło się (${errorKey}). Sprawdź Client ID/Secret i Redirect URL w Discord Developer Portal.`);

  return (
    <AuthChrome>
      <div className="auth-card">
        <h1>Logowanie</h1>
        <p>
          Po zalogowaniu zobaczysz serwery, na których masz Manage Server /
          Administrator i na których jest bot.
        </p>
        {errorMessage ? <p className="flash error">{errorMessage}</p> : null}
        <DiscordSignInButton />
      </div>
    </AuthChrome>
  );
}

import Link from "next/link";
import { Header } from "@/components/Header";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;

  return (
    <>
      <Header />
      <main className="container hero">
        <h1>Logowanie</h1>
        <p>
          Użyj konta Discord. Po zalogowaniu zobaczysz serwery, na których masz
          uprawnienie Manage Server / Administrator i na których jest bot.
        </p>
        {params.error ? (
          <p className="flash error">
            Logowanie nie powiodło się ({params.error}). Sprawdź Client ID/Secret
            i Redirect URL w Discord Developer Portal.
          </p>
        ) : null}
        <Link href="/api/auth/signin/discord" className="btn">
          Kontynuuj z Discord
        </Link>
      </main>
    </>
  );
}

import Link from "next/link";
import { AuthChrome } from "@/components/AuthChrome";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <AuthChrome>
      <div className="auth-card">
        <h1>Panel bota Discord</h1>
        <p>
          Moderacja, historia spraw i ustawienia serwera. Zaloguj się kontem
          Discord z uprawnieniem zarządzania serwerem.
        </p>
        {session?.user ? (
          <Link href="/dashboard" className="btn btn-block">
            Przejdź do panelu
          </Link>
        ) : (
          <Link href="/login" className="btn btn-block">
            Zaloguj przez Discord
          </Link>
        )}
      </div>
    </AuthChrome>
  );
}

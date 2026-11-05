import Link from "next/link";
import { Header } from "@/components/Header";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <>
      <Header />
      <main className="container hero">
        <h1>Panel bota Discord</h1>
        <p>
          Moderacja, historia spraw i ustawienia serwera w jednym miejscu.
          Zaloguj się kontem Discord z uprawnieniem zarządzania serwerem.
        </p>
        {session?.user ? (
          <Link href="/dashboard" className="btn">
            Przejdź do panelu
          </Link>
        ) : (
          <Link href="/login" className="btn">
            Zaloguj przez Discord
          </Link>
        )}
      </main>
    </>
  );
}

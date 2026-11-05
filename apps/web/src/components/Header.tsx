import Link from "next/link";
import { getSession } from "@/lib/session";

export async function Header() {
  const session = await getSession();

  return (
    <header className="site-header container">
      <Link href="/" className="brand">
        Nice HVH <span>Bot</span>
      </Link>
      <nav style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {session?.user ? (
          <>
            <Link href="/dashboard" className="muted">
              Panel
            </Link>
            <span className="muted">{session.user.username || session.user.name}</span>
            <Link href="/api/auth/signout" className="btn btn-ghost">
              Wyloguj
            </Link>
          </>
        ) : (
          <Link href="/login" className="btn">
            Zaloguj przez Discord
          </Link>
        )}
      </nav>
    </header>
  );
}

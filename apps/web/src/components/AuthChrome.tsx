import Link from "next/link";
import { getSession } from "@/lib/session";

export async function AuthChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="auth-shell">
      <header className="auth-top">
        <Link href="/" className="sidebar-brand" style={{ padding: 0, border: 0 }}>
          <div className="brand-mark">NH</div>
          <div className="brand-title">
            Nice HVH
            <span>Panel bota</span>
          </div>
        </Link>
        <nav style={{ display: "flex", gap: "0.65rem", alignItems: "center" }}>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="btn btn-ghost">
                Panel
              </Link>
              <Link href="/api/auth/signout" className="btn btn-ghost">
                Wyloguj
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn">
              Zaloguj
            </Link>
          )}
        </nav>
      </header>
      <div className="auth-main">{children}</div>
    </div>
  );
}

import Link from "next/link";
import { AuthChrome } from "@/components/AuthChrome";

export default function NotFound() {
  return (
    <AuthChrome>
      <div className="auth-card">
        <h1>Nie znaleziono</h1>
        <p>Ta strona nie istnieje albo nie masz do niej dostępu.</p>
        <Link href="/" className="btn btn-block">
          Strona główna
        </Link>
      </div>
    </AuthChrome>
  );
}

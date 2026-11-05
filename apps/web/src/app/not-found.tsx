import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container hero">
        <h1>Nie znaleziono</h1>
        <p>Ta strona nie istnieje albo nie masz do niej dostępu.</p>
        <Link href="/" className="btn">
          Strona główna
        </Link>
      </main>
    </>
  );
}

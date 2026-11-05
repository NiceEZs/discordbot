import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { requireSession } from "@/lib/session";
import {
  canManageGuild,
  fetchUserGuilds,
  getAccountAccessToken,
} from "@/lib/discord";
import { prisma } from "@nice-hvh/db";

type Props = { params: Promise<{ guildId: string }> };

const ACTION_PL: Record<string, string> = {
  WARN: "Ostrzeżenie",
  MUTE: "Mute",
  KICK: "Kick",
  BAN: "Ban",
  UNMUTE: "Unmute",
  UNBAN: "Unban",
};

export default async function GuildCasesPage({ params }: Props) {
  const session = await requireSession();
  const { guildId } = await params;

  const token = await getAccountAccessToken(session.user.id);
  if (!token) redirect("/login");

  const guilds = await fetchUserGuilds(token);
  const discordGuild = guilds.find((g) => g.id === guildId);
  if (!discordGuild || !canManageGuild(discordGuild.permissions)) {
    notFound();
  }

  const guild = await prisma.guild.findUnique({
    where: { discordId: guildId },
  });

  if (!guild) {
    return (
      <>
        <Header />
        <main className="container">
          <p className="flash error">Serwer nie jest w bazie.</p>
          <Link href="/dashboard">← Wróć</Link>
        </main>
      </>
    );
  }

  const cases = await prisma.modCase.findMany({
    where: { guildId: guild.id },
    orderBy: { caseNumber: "desc" },
    take: 50,
  });

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: "3rem" }}>
        <p className="muted">
          <Link href="/dashboard">← Serwery</Link>
        </p>
        <h1 style={{ marginTop: 0 }}>{discordGuild.name} — sprawy</h1>

        <nav className="tabs">
          <Link href={`/dashboard/${guildId}`}>Ustawienia</Link>
          <Link href={`/dashboard/${guildId}/cases`} className="active">
            Sprawy
          </Link>
        </nav>

        <section className="panel">
          <h2>Historia moderacji</h2>
          {cases.length === 0 ? (
            <p className="muted">Brak spraw. Użyj /warn, /mute, /kick lub /ban.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Akcja</th>
                    <th>Cel</th>
                    <th>Moderator</th>
                    <th>Powód</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id}>
                      <td>{c.caseNumber}</td>
                      <td>{ACTION_PL[c.action] ?? c.action}</td>
                      <td>
                        <code>{c.targetDiscordId}</code>
                      </td>
                      <td>
                        <code>{c.moderatorDiscordId}</code>
                      </td>
                      <td>{c.reason ?? "—"}</td>
                      <td>{c.createdAt.toLocaleString("pl-PL")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

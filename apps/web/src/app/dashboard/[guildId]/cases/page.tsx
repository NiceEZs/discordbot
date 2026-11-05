import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
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
      <main className="page">
        <header className="page-header">
          <h1>{discordGuild.name}</h1>
          <p>Serwer nie jest w bazie.</p>
        </header>
        <EmptyState
          title="Brak serwera w bazie"
          description="Uruchom bota na tym serwerze, żeby zaczął zapisywać sprawy moderacji."
        />
        <p style={{ marginTop: "1rem" }}>
          <Link href="/dashboard" className="btn btn-ghost">
            Wróć do serwerów
          </Link>
        </p>
      </main>
    );
  }

  const cases = await prisma.modCase.findMany({
    where: { guildId: guild.id },
    orderBy: { caseNumber: "desc" },
    take: 50,
  });

  return (
    <main className="page">
      <header className="page-header">
        <h1>Sprawy — {discordGuild.name}</h1>
        <p>Ostatnie 50 wpisów z historii moderacji.</p>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>Historia moderacji</h2>
          <p>Wpisy z komend /warn, /mute, /kick i /ban.</p>
        </div>

        {cases.length === 0 ? (
          <EmptyState
            title="Brak spraw"
            description="Użyj /warn, /mute, /kick lub /ban na Discordzie — pojawią się tutaj."
          />
        ) : (
          <div className="table-wrap">
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
                    <td>
                      <span className="badge">
                        {ACTION_PL[c.action] ?? c.action}
                      </span>
                    </td>
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
  );
}

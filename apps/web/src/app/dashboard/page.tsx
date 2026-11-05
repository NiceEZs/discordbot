import Link from "next/link";
import { Header } from "@/components/Header";
import { requireSession } from "@/lib/session";
import {
  canManageGuild,
  fetchUserGuilds,
  getAccountAccessToken,
  guildIconUrl,
} from "@/lib/discord";
import { prisma } from "@nice-hvh/db";

export default async function DashboardPage() {
  const session = await requireSession();
  const token = await getAccountAccessToken(session.user.id);

  let error: string | null = null;
  let guilds: Awaited<ReturnType<typeof fetchUserGuilds>> = [];

  if (!token) {
    error =
      "Brak tokenu Discord (scope guilds). Wyloguj się i zaloguj ponownie.";
  } else {
    try {
      const all = await fetchUserGuilds(token);
      guilds = all.filter((g) => canManageGuild(g.permissions));
    } catch {
      error = "Nie udało się pobrać listy serwerów z Discord API.";
    }
  }

  const botGuildIds = new Set(
    (
      await prisma.guild.findMany({
        select: { discordId: true },
      })
    ).map((g) => g.discordId),
  );

  const manageable = guilds.filter((g) => botGuildIds.has(g.id));
  const withoutBot = guilds.filter((g) => !botGuildIds.has(g.id));

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: "3rem" }}>
        <h1 style={{ marginTop: 0 }}>Twoje serwery</h1>
        <p className="muted">
          Pokazujemy serwery, na których masz Manage Server / Administrator i na
          których bot już był online (zsynchronizowany w bazie).
        </p>

        {error ? <p className="flash error">{error}</p> : null}

        <section className="panel" style={{ marginBottom: "1.5rem" }}>
          <h2>Gotowe do konfiguracji</h2>
          {manageable.length === 0 ? (
            <p className="muted">
              Brak wspólnych serwerów. Zaproś bota i uruchom go lokalnie, żeby
              zsynchronizował guild.
            </p>
          ) : (
            <div className="guild-list">
              {manageable.map((g) => {
                const icon = guildIconUrl(g);
                return (
                  <Link key={g.id} href={`/dashboard/${g.id}`} className="guild-row">
                    {icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="guild-icon" src={icon} alt="" />
                    ) : (
                      <div className="guild-icon">{g.name.slice(0, 1)}</div>
                    )}
                    <div>
                      <strong>{g.name}</strong>
                      <div className="muted" style={{ fontSize: "0.85rem" }}>
                        {g.id}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {withoutBot.length > 0 ? (
          <section className="panel">
            <h2>Serwery bez bota w bazie</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Bot nie był jeszcze na tych serwerach (lub baza jest pusta).
            </p>
            <ul className="muted">
              {withoutBot.map((g) => (
                <li key={g.id}>{g.name}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}

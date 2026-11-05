import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { requireSession } from "@/lib/session";
import { guildIconUrl } from "@/lib/discord";
import { loadPanelGuilds } from "@/lib/panel-guilds";

export default async function DashboardPage() {
  const session = await requireSession();
  const { manageable, withoutBot, error } = await loadPanelGuilds(
    session.user.id,
  );

  return (
    <main className="page">
      <header className="page-header">
        <h1>Serwery</h1>
        <p>
          Serwery, na których masz Manage Server / Administrator i na których
          bot jest już zsynchronizowany w bazie.
        </p>
      </header>

      {error ? <p className="flash error">{error}</p> : null}

      <section className="section">
        <div className="section-head">
          <h2>Gotowe do konfiguracji</h2>
          <p>Wybierz serwer, aby otworzyć ustawienia.</p>
        </div>

        {manageable.length === 0 ? (
          <EmptyState
            title="Brak wspólnych serwerów"
            description="Zaproś bota na serwer i uruchom go lokalnie, żeby zsynchronizował guild w bazie."
          />
        ) : (
          <div className="guild-list">
            {manageable.map((g) => {
              const icon = guildIconUrl(g);
              return (
                <Link
                  key={g.id}
                  href={`/dashboard/${g.id}`}
                  className="guild-row"
                >
                  {icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="guild-icon lg" src={icon} alt="" />
                  ) : (
                    <div className="guild-icon lg">{g.name.slice(0, 1)}</div>
                  )}
                  <div className="meta">
                    <strong>{g.name}</strong>
                    <span>{g.id}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {withoutBot.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2>Serwery bez bota w bazie</h2>
            <p>
              Bot nie był jeszcze na tych serwerach (lub baza jest pusta).
            </p>
          </div>
          <ul className="plain-list">
            {withoutBot.map((g) => (
              <li key={g.id}>{g.name}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

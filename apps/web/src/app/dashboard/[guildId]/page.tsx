import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { GuildSettingsForm } from "@/components/GuildSettingsForm";
import { requireSession } from "@/lib/session";
import {
  canManageGuild,
  fetchUserGuilds,
  getAccountAccessToken,
} from "@/lib/discord";
import { prisma } from "@nice-hvh/db";

type Props = { params: Promise<{ guildId: string }> };

export default async function GuildSettingsPage({ params }: Props) {
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
    include: { settings: true },
  });

  if (!guild?.settings) {
    return (
      <main className="page">
        <header className="page-header">
          <h1>{discordGuild.name}</h1>
          <p>Serwer nie jest jeszcze gotowy do konfiguracji.</p>
        </header>
        <EmptyState
          title="Brak danych w bazie"
          description="Uruchom bota na tym serwerze, żeby zsynchronizował guild i ustawienia."
        />
        <p style={{ marginTop: "1rem" }}>
          <Link href="/dashboard" className="btn btn-ghost">
            Wróć do serwerów
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>{discordGuild.name}</h1>
        <p>Ustawienia moderacji dla wybranego serwera.</p>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>Ustawienia guild</h2>
          <p>Zmiany zapisują się w bazie i obowiązują od razu dla bota.</p>
        </div>
        <div className="form-surface">
          <GuildSettingsForm
            guildId={guildId}
            initial={{
              moderationEnabled: guild.settings.moderationEnabled,
              modLogChannelId: guild.settings.modLogChannelId,
              moderatorRoleId: guild.settings.moderatorRoleId,
              muteDefaultMinutes: guild.settings.muteDefaultMinutes,
              locale: guild.settings.locale,
            }}
          />
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
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
      <>
        <Header />
        <main className="container">
          <p className="flash error">
            Serwer nie jest jeszcze w bazie. Uruchom bota na tym serwerze.
          </p>
          <Link href="/dashboard">← Wróć</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: "3rem" }}>
        <p className="muted">
          <Link href="/dashboard">← Serwery</Link>
        </p>
        <h1 style={{ marginTop: 0 }}>{discordGuild.name}</h1>

        <nav className="tabs">
          <Link href={`/dashboard/${guildId}`} className="active">
            Ustawienia
          </Link>
          <Link href={`/dashboard/${guildId}/cases`}>Sprawy</Link>
        </nav>

        <section className="panel">
          <h2>Ustawienia guild</h2>
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
        </section>
      </main>
    </>
  );
}

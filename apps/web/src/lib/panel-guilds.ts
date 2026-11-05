import { prisma } from "@nice-hvh/db";
import {
  canManageGuild,
  fetchUserGuilds,
  getAccountAccessToken,
  type DiscordGuild,
} from "./discord";

export type PanelGuildsResult = {
  manageable: DiscordGuild[];
  withoutBot: DiscordGuild[];
  error: string | null;
};

export async function loadPanelGuilds(userId: string): Promise<PanelGuildsResult> {
  const token = await getAccountAccessToken(userId);

  if (!token) {
    return {
      manageable: [],
      withoutBot: [],
      error:
        "Brak tokenu Discord (scope guilds). Wyloguj się i zaloguj ponownie.",
    };
  }

  let guilds: DiscordGuild[] = [];
  try {
    const all = await fetchUserGuilds(token);
    guilds = all.filter((g) => canManageGuild(g.permissions));
  } catch {
    return {
      manageable: [],
      withoutBot: [],
      error: "Nie udało się pobrać listy serwerów z Discord API.",
    };
  }

  const botGuildIds = new Set(
    (
      await prisma.guild.findMany({
        select: { discordId: true },
      })
    ).map((g) => g.discordId),
  );

  return {
    manageable: guilds.filter((g) => botGuildIds.has(g.id)),
    withoutBot: guilds.filter((g) => !botGuildIds.has(g.id)),
    error: null,
  };
}

import { prisma, type Guild, type GuildSettings } from "@nice-hvh/db";

export type GuildWithSettings = Guild & { settings: GuildSettings | null };

/** Upsert guild + domyślne settings przy pierwszym kontakcie */
export async function ensureGuild(
  discordId: string,
  name: string,
  icon: string | null,
  ownerId: string | null,
): Promise<GuildWithSettings> {
  const guild = await prisma.guild.upsert({
    where: { discordId },
    create: {
      discordId,
      name,
      icon,
      ownerId: ownerId ?? undefined,
      settings: { create: {} },
    },
    update: {
      name,
      icon,
      ownerId: ownerId ?? undefined,
    },
    include: { settings: true },
  });

  if (!guild.settings) {
    const settings = await prisma.guildSettings.create({
      data: { guildId: guild.id },
    });
    return { ...guild, settings };
  }

  return guild;
}

export async function getGuildSettings(discordGuildId: string) {
  const guild = await prisma.guild.findUnique({
    where: { discordId: discordGuildId },
    include: { settings: true },
  });
  return guild?.settings ?? null;
}

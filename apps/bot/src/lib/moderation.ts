import { prisma, type ModAction } from "@nice-hvh/db";
import type { Guild as DiscordGuild, GuildMember, User } from "discord.js";
import { ensureGuild } from "./guild";

export async function createModCase(params: {
  discordGuild: DiscordGuild;
  action: ModAction;
  target: User;
  moderator: User;
  reason?: string | null;
  durationMinutes?: number | null;
}) {
  const guild = await ensureGuild(
    params.discordGuild.id,
    params.discordGuild.name,
    params.discordGuild.icon,
    params.discordGuild.ownerId,
  );

  const last = await prisma.modCase.findFirst({
    where: { guildId: guild.id },
    orderBy: { caseNumber: "desc" },
    select: { caseNumber: true },
  });

  const caseNumber = (last?.caseNumber ?? 0) + 1;

  return prisma.modCase.create({
    data: {
      caseNumber,
      guildId: guild.id,
      action: params.action,
      reason: params.reason ?? null,
      targetDiscordId: params.target.id,
      moderatorDiscordId: params.moderator.id,
      durationMinutes: params.durationMinutes ?? null,
    },
  });
}

export function canModerate(
  moderator: GuildMember,
  target: GuildMember,
): { ok: true } | { ok: false; message: string } {
  if (moderator.id === target.id) {
    return { ok: false, message: "Nie możesz moderować samego siebie." };
  }
  if (target.id === moderator.guild.ownerId) {
    return { ok: false, message: "Nie możesz moderować właściciela serwera." };
  }
  if (
    target.roles.highest.position >= moderator.roles.highest.position &&
    moderator.id !== moderator.guild.ownerId
  ) {
    return {
      ok: false,
      message: "Cel ma taką samą lub wyższą rolę niż Ty.",
    };
  }
  return { ok: true };
}

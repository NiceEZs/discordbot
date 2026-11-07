import {
  EmbedBuilder,
  type Guild,
  type TextChannel,
  type User,
  type ColorResolvable,
} from "discord.js";
import type { ModAction } from "@nice-hvh/db";
import { getGuildSettings } from "./guild";

type ChannelLogTarget = {
  id: string;
  name: string;
  type: number | string;
};

const ACTION_META: Record<
  ModAction,
  { label: string; color: ColorResolvable }
> = {
  WARN: { label: "Ostrzeżenie", color: 0xd4a24c },
  MUTE: { label: "Mute (timeout)", color: 0xe67e22 },
  KICK: { label: "Kick", color: 0xe74c3c },
  BAN: { label: "Ban", color: 0xc0392b },
  UNMUTE: { label: "Unmute", color: 0x2ecc71 },
  UNBAN: { label: "Unban", color: 0x27ae60 },
};

async function resolveLogChannel(
  guild: Guild,
): Promise<TextChannel | null> {
  const settings = await getGuildSettings(guild.id);
  if (!settings?.loggingEnabled || !settings.modLogChannelId) return null;

  const channel = await guild.channels
    .fetch(settings.modLogChannelId)
    .catch(() => null);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) return null;
  return channel as TextChannel;
}

export async function sendLogEmbed(
  guild: Guild,
  embed: EmbedBuilder,
): Promise<void> {
  const channel = await resolveLogChannel(guild);
  if (!channel) return;
  await channel.send({ embeds: [embed] }).catch((err) => {
    console.error(`[bot] Nie udało się wysłać loga na #${channel.id}:`, err);
  });
}

export async function logModAction(params: {
  guild: Guild;
  action: ModAction;
  target: User;
  moderator: User;
  reason?: string | null;
  caseNumber: number;
  durationMinutes?: number | null;
}): Promise<void> {
  const settings = await getGuildSettings(params.guild.id);
  if (!settings?.loggingEnabled || !settings.logModActions) return;

  const meta = ACTION_META[params.action];
  const embed = new EmbedBuilder()
    .setColor(meta.color)
    .setTitle(`Moderacja · ${meta.label}`)
    .addFields(
      {
        name: "Użytkownik",
        value: `${params.target.tag} (\`${params.target.id}\`)`,
        inline: true,
      },
      {
        name: "Moderator",
        value: `${params.moderator.tag} (\`${params.moderator.id}\`)`,
        inline: true,
      },
      {
        name: "Case",
        value: `#${params.caseNumber}`,
        inline: true,
      },
      {
        name: "Powód",
        value: params.reason?.trim() || "Brak podanego powodu",
      },
    )
    .setTimestamp(new Date())
    .setFooter({ text: params.guild.name });

  if (params.durationMinutes != null) {
    embed.addFields({
      name: "Czas",
      value: `${params.durationMinutes} min`,
      inline: true,
    });
  }

  await sendLogEmbed(params.guild, embed);
}

export async function logMemberJoin(guild: Guild, user: User): Promise<void> {
  const settings = await getGuildSettings(guild.id);
  if (!settings?.loggingEnabled || !settings.logMemberJoin) return;

  const embed = new EmbedBuilder()
    .setColor(0x2eb89a)
    .setTitle("Dołączenie")
    .setDescription(`${user} (\`${user.tag}\` · \`${user.id}\`) dołączył na serwer.`)
    .addFields({
      name: "Wiek konta",
      value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
      inline: true,
    })
    .setThumbnail(user.displayAvatarURL({ size: 128 }))
    .setTimestamp(new Date());

  await sendLogEmbed(guild, embed);
}

export async function logMemberLeave(guild: Guild, user: User): Promise<void> {
  const settings = await getGuildSettings(guild.id);
  if (!settings?.loggingEnabled || !settings.logMemberLeave) return;

  const embed = new EmbedBuilder()
    .setColor(0x8a9bb0)
    .setTitle("Opuszczenie")
    .setDescription(`**${user.tag}** (\`${user.id}\`) opuścił serwer.`)
    .setThumbnail(user.displayAvatarURL({ size: 128 }))
    .setTimestamp(new Date());

  await sendLogEmbed(guild, embed);
}

export async function logBanEvent(
  guild: Guild,
  user: User,
  kind: "ban" | "unban",
): Promise<void> {
  const settings = await getGuildSettings(guild.id);
  if (!settings?.loggingEnabled || !settings.logBans) return;

  const embed = new EmbedBuilder()
    .setColor(kind === "ban" ? 0xc0392b : 0x27ae60)
    .setTitle(kind === "ban" ? "Ban (Discord)" : "Unban (Discord)")
    .setDescription(
      `**${user.tag}** (\`${user.id}\`) ${
        kind === "ban" ? "został zbanowany" : "został odbanowany"
      }.`,
    )
    .setTimestamp(new Date());

  await sendLogEmbed(guild, embed);
}

export async function logChannelEvent(
  guild: Guild,
  channel: ChannelLogTarget,
  kind: "create" | "delete",
): Promise<void> {
  const settings = await getGuildSettings(guild.id);
  if (!settings?.loggingEnabled || !settings.logChannels) return;

  const embed = new EmbedBuilder()
    .setColor(kind === "create" ? 0x3498db : 0x95a5a6)
    .setTitle(kind === "create" ? "Kanał utworzony" : "Kanał usunięty")
    .setDescription(
      `**#${channel.name}** (\`${channel.id}\`) · typ \`${channel.type}\``,
    )
    .setTimestamp(new Date());

  await sendLogEmbed(guild, embed);
}

export async function logRoleEvent(
  guild: Guild,
  roleName: string,
  roleId: string,
  kind: "create" | "delete",
): Promise<void> {
  const settings = await getGuildSettings(guild.id);
  if (!settings?.loggingEnabled || !settings.logRoles) return;

  const embed = new EmbedBuilder()
    .setColor(kind === "create" ? 0x9b59b6 : 0x7f8c8d)
    .setTitle(kind === "create" ? "Rola utworzona" : "Rola usunięta")
    .setDescription(`**${roleName}** (\`${roleId}\`)`)
    .setTimestamp(new Date());

  await sendLogEmbed(guild, embed);
}

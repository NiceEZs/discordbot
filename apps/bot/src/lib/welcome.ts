import type { Guild, GuildMember, PartialGuildMember, User } from "discord.js";
import { getGuildSettings } from "./guild";
import {
  DEFAULT_GOODBYE,
  DEFAULT_WELCOME,
  renderTemplate,
} from "./templates";

function templateVars(
  guild: Guild,
  user: User,
  memberCount: number,
) {
  return {
    user: user.username,
    userTag: user.tag,
    userMention: `<@${user.id}>`,
    server: guild.name,
    memberCount,
  };
}

export async function sendWelcome(member: GuildMember): Promise<void> {
  const settings = await getGuildSettings(member.guild.id);
  if (!settings?.welcomeEnabled || !settings.welcomeChannelId) return;

  const channel = await member.guild.channels
    .fetch(settings.welcomeChannelId)
    .catch(() => null);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

  const body = renderTemplate(
    settings.welcomeMessage?.trim() || DEFAULT_WELCOME,
    templateVars(member.guild, member.user, member.guild.memberCount),
  );

  await channel.send({ content: body }).catch((err) => {
    console.error(`[bot] Welcome nie wysłany (#${channel.id}):`, err);
  });
}

export async function sendGoodbye(
  member: GuildMember | PartialGuildMember,
): Promise<void> {
  const user = member.user;
  if (!user) return;

  const settings = await getGuildSettings(member.guild.id);
  if (!settings?.goodbyeEnabled || !settings.goodbyeChannelId) return;

  const channel = await member.guild.channels
    .fetch(settings.goodbyeChannelId)
    .catch(() => null);
  if (!channel || !channel.isTextBased() || channel.isDMBased()) return;

  const body = renderTemplate(
    settings.goodbyeMessage?.trim() || DEFAULT_GOODBYE,
    templateVars(member.guild, user, member.guild.memberCount),
  );

  await channel.send({ content: body }).catch((err) => {
    console.error(`[bot] Goodbye nie wysłany (#${channel.id}):`, err);
  });
}

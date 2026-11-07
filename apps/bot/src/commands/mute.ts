import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { createModCase, canModerate } from "../lib/moderation";
import { getGuildSettings } from "../lib/guild";
import { logModAction } from "../lib/logging";

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("Wycisz użytkownika (timeout Discord)")
  .addUserOption((o) =>
    o.setName("uzytkownik").setDescription("Kogo wyciszyć").setRequired(true),
  )
  .addIntegerOption((o) =>
    o
      .setName("minuty")
      .setDescription("Czas wyciszenia w minutach")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(40320),
  )
  .addStringOption((o) =>
    o.setName("powod").setDescription("Powód").setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  const settings = await getGuildSettings(interaction.guild.id);
  if (settings && !settings.moderationEnabled) {
    await interaction.reply({
      content: "Moderacja jest wyłączona w ustawieniach tego serwera.",
      ephemeral: true,
    });
    return;
  }

  const targetUser = interaction.options.getUser("uzytkownik", true);
  const minutes =
    interaction.options.getInteger("minuty") ??
    settings?.muteDefaultMinutes ??
    60;
  const reason =
    interaction.options.getString("powod") ?? "Brak podanego powodu";

  const targetMember = await interaction.guild.members
    .fetch(targetUser.id)
    .catch(() => null);

  if (!targetMember) {
    await interaction.reply({
      content: "Nie znaleziono tego użytkownika na serwerze.",
      ephemeral: true,
    });
    return;
  }

  const moderator = await interaction.guild.members.fetch(interaction.user.id);
  const check = canModerate(moderator, targetMember);
  if (!check.ok) {
    await interaction.reply({ content: check.message, ephemeral: true });
    return;
  }

  await targetMember.timeout(minutes * 60 * 1000, reason);

  const modCase = await createModCase({
    discordGuild: interaction.guild,
    action: "MUTE",
    target: targetUser,
    moderator: interaction.user,
    reason,
    durationMinutes: minutes,
  });

  await logModAction({
    guild: interaction.guild,
    action: "MUTE",
    target: targetUser,
    moderator: interaction.user,
    reason,
    caseNumber: modCase.caseNumber,
    durationMinutes: minutes,
  });

  await interaction.reply({
    content: `Wyciszono **${targetUser.tag}** na **${minutes}** min. Case \`#${modCase.caseNumber}\` — ${reason}`,
  });
}

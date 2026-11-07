import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { createModCase, canModerate } from "../lib/moderation";
import { getGuildSettings } from "../lib/guild";
import { logModAction } from "../lib/logging";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Ostrzeż użytkownika")
  .addUserOption((o) =>
    o.setName("uzytkownik").setDescription("Kogo ostrzec").setRequired(true),
  )
  .addStringOption((o) =>
    o.setName("powod").setDescription("Powód ostrzeżenia").setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.member) return;

  const settings = await getGuildSettings(interaction.guild.id);
  if (settings && !settings.moderationEnabled) {
    await interaction.reply({
      content: "Moderacja jest wyłączona w ustawieniach tego serwera.",
      ephemeral: true,
    });
    return;
  }

  const targetUser = interaction.options.getUser("uzytkownik", true);
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

  const modCase = await createModCase({
    discordGuild: interaction.guild,
    action: "WARN",
    target: targetUser,
    moderator: interaction.user,
    reason,
  });

  await logModAction({
    guild: interaction.guild,
    action: "WARN",
    target: targetUser,
    moderator: interaction.user,
    reason,
    caseNumber: modCase.caseNumber,
  });

  await interaction.reply({
    content: `Ostrzeżono **${targetUser.tag}**. Case \`#${modCase.caseNumber}\` — ${reason}`,
  });
}

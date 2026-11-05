import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { createModCase, canModerate } from "../lib/moderation";
import { getGuildSettings } from "../lib/guild";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Zbanuj użytkownika")
  .addUserOption((o) =>
    o.setName("uzytkownik").setDescription("Kogo zbanować").setRequired(true),
  )
  .addStringOption((o) =>
    o.setName("powod").setDescription("Powód").setRequired(false),
  )
  .addIntegerOption((o) =>
    o
      .setName("usun_wiadomosci_dni")
      .setDescription("Usuń historię wiadomości (0–7 dni)")
      .setRequired(false)
      .setMinValue(0)
      .setMaxValue(7),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

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
  const reason =
    interaction.options.getString("powod") ?? "Brak podanego powodu";
  const deleteMessageDays =
    interaction.options.getInteger("usun_wiadomosci_dni") ?? 0;

  const targetMember = await interaction.guild.members
    .fetch(targetUser.id)
    .catch(() => null);

  if (targetMember) {
    if (!targetMember.bannable) {
      await interaction.reply({
        content:
          "Nie mogę zbanować tego użytkownika (brak uprawnień / hierarchia ról).",
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
  }

  await interaction.guild.members.ban(targetUser.id, {
    reason,
    deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
  });

  const modCase = await createModCase({
    discordGuild: interaction.guild,
    action: "BAN",
    target: targetUser,
    moderator: interaction.user,
    reason,
  });

  await interaction.reply({
    content: `Zbanowano **${targetUser.tag}**. Case \`#${modCase.caseNumber}\` — ${reason}`,
  });
}

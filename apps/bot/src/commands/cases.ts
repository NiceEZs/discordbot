import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import { prisma } from "@nice-hvh/db";
import { ensureGuild } from "../lib/guild";

export const data = new SlashCommandBuilder()
  .setName("cases")
  .setDescription("Pokaż ostatnie sprawy moderacyjne")
  .addUserOption((o) =>
    o
      .setName("uzytkownik")
      .setDescription("Filtruj po użytkowniku")
      .setRequired(false),
  )
  .addIntegerOption((o) =>
    o
      .setName("limit")
      .setDescription("Ile spraw pokazać (domyślnie 10)")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(25),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) return;

  const guild = await ensureGuild(
    interaction.guild.id,
    interaction.guild.name,
    interaction.guild.icon,
    interaction.guild.ownerId,
  );

  const target = interaction.options.getUser("uzytkownik");
  const limit = interaction.options.getInteger("limit") ?? 10;

  const cases = await prisma.modCase.findMany({
    where: {
      guildId: guild.id,
      ...(target ? { targetDiscordId: target.id } : {}),
    },
    orderBy: { caseNumber: "desc" },
    take: limit,
  });

  if (cases.length === 0) {
    await interaction.reply({
      content: target
        ? `Brak spraw dla **${target.tag}**.`
        : "Brak spraw moderacyjnych na tym serwerze.",
      ephemeral: true,
    });
    return;
  }

  const lines = cases.map(
    (c) =>
      `\`#${c.caseNumber}\` **${c.action}** <@${c.targetDiscordId}> — ${c.reason ?? "—"} (<t:${Math.floor(c.createdAt.getTime() / 1000)}:R>)`,
  );

  await interaction.reply({
    content: `**Ostatnie sprawy**${target ? ` — ${target.tag}` : ""}\n${lines.join("\n")}`,
    ephemeral: true,
  });
}

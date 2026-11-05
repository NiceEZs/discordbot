import type { Client } from "discord.js";
import { ensureGuild } from "../lib/guild";

export async function onReady(client: Client) {
  console.log(`[bot] Zalogowano jako ${client.user?.tag}`);

  for (const [, guild] of client.guilds.cache) {
    try {
      await ensureGuild(guild.id, guild.name, guild.icon, guild.ownerId);
    } catch (err) {
      console.error(`[bot] Nie udało się zsynchronizować guild ${guild.id}:`, err);
    }
  }
}

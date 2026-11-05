import type { Guild } from "discord.js";
import { ensureGuild } from "../lib/guild";

export async function onGuildCreate(guild: Guild) {
  console.log(`[bot] Dołączono do serwera: ${guild.name} (${guild.id})`);
  await ensureGuild(guild.id, guild.name, guild.icon, guild.ownerId);
}

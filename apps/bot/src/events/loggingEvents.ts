import { Events, type Client, type GuildBan, type Role } from "discord.js";
import { logBanEvent, logChannelEvent, logRoleEvent } from "../lib/logging";

/** Rejestruje kluczowe eventy Discord (ban/unban, kanały, role). */
export function registerLoggingEvents(client: Client): void {
  client.on(Events.GuildBanAdd, async (ban: GuildBan) => {
    await logBanEvent(ban.guild, ban.user, "ban");
  });

  client.on(Events.GuildBanRemove, async (ban: GuildBan) => {
    await logBanEvent(ban.guild, ban.user, "unban");
  });

  client.on(Events.ChannelCreate, async (channel) => {
    if (channel.isDMBased() || !("guild" in channel) || !channel.guild) return;
    await logChannelEvent(
      channel.guild,
      { id: channel.id, name: channel.name, type: channel.type },
      "create",
    );
  });

  client.on(Events.ChannelDelete, async (channel) => {
    if (!("guild" in channel) || !channel.guild || !("name" in channel)) return;
    await logChannelEvent(
      channel.guild,
      {
        id: channel.id,
        name: typeof channel.name === "string" ? channel.name : channel.id,
        type: channel.type,
      },
      "delete",
    );
  });

  client.on(Events.GuildRoleCreate, async (role: Role) => {
    await logRoleEvent(role.guild, role.name, role.id, "create");
  });

  client.on(Events.GuildRoleDelete, async (role: Role) => {
    await logRoleEvent(role.guild, role.name, role.id, "delete");
  });
}

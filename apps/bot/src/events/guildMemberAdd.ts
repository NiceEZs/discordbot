import type { GuildMember } from "discord.js";
import { logMemberJoin } from "../lib/logging";
import { sendWelcome } from "../lib/welcome";

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
  await Promise.allSettled([
    sendWelcome(member),
    logMemberJoin(member.guild, member.user),
  ]);
}

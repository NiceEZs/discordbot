import type { GuildMember, PartialGuildMember } from "discord.js";
import { logMemberLeave } from "../lib/logging";
import { sendGoodbye } from "../lib/welcome";

export async function onGuildMemberRemove(
  member: GuildMember | PartialGuildMember,
): Promise<void> {
  await Promise.allSettled([
    sendGoodbye(member),
    member.user
      ? logMemberLeave(member.guild, member.user)
      : Promise.resolve(),
  ]);
}

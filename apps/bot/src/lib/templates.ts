/** Placeholders: {user} {user.tag} {user.mention} {server} {memberCount} */
export function renderTemplate(
  template: string,
  vars: {
    user: string;
    userTag: string;
    userMention: string;
    server: string;
    memberCount: number | string;
  },
): string {
  return template
    .replaceAll("{user.mention}", vars.userMention)
    .replaceAll("{user.tag}", vars.userTag)
    .replaceAll("{user}", vars.user)
    .replaceAll("{server}", vars.server)
    .replaceAll("{memberCount}", String(vars.memberCount));
}

export const DEFAULT_WELCOME =
  "Witaj {user.mention} na **{server}**! Jesteś członkiem nr **{memberCount}**.";

export const DEFAULT_GOODBYE =
  "**{user.tag}** opuścił serwer **{server}**.";

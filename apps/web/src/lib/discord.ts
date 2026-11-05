const DISCORD_API = "https://discord.com/api/v10";

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

const MANAGE_GUILD = 0x20n;
const ADMINISTRATOR = 0x8n;

export function canManageGuild(permissions: string): boolean {
  try {
    const perms = BigInt(permissions);
    return (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}

export function guildIconUrl(guild: Pick<DiscordGuild, "id" | "icon">): string | null {
  if (!guild.icon) return null;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
}

/** Pobiera guildy użytkownika z Discord API (wymaga scope guilds + access_token) */
export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch(`${DISCORD_API}/users/@me/guilds`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Discord API guilds: ${res.status}`);
  }
  return res.json() as Promise<DiscordGuild[]>;
}

export async function getAccountAccessToken(userId: string): Promise<string | null> {
  const { prisma } = await import("@nice-hvh/db");
  const account = await prisma.account.findFirst({
    where: { userId, provider: "discord" },
    select: { access_token: true },
  });
  return account?.access_token ?? null;
}

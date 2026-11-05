import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@nice-hvh/db";
import {
  canManageGuild,
  fetchUserGuilds,
  getAccountAccessToken,
} from "@/lib/discord";

type Ctx = { params: Promise<{ guildId: string }> };

async function assertGuildAccess(userId: string, guildDiscordId: string) {
  const token = await getAccountAccessToken(userId);
  if (!token) return false;
  const guilds = await fetchUserGuilds(token);
  const g = guilds.find((x) => x.id === guildDiscordId);
  return Boolean(g && canManageGuild(g.permissions));
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const { guildId } = await ctx.params;
  if (!(await assertGuildAccess(session.user.id, guildId))) {
    return NextResponse.json({ error: "Brak dostępu do serwera" }, { status: 403 });
  }

  const guild = await prisma.guild.findUnique({
    where: { discordId: guildId },
    include: { settings: true },
  });

  if (!guild?.settings) {
    return NextResponse.json({ error: "Serwer nie jest jeszcze zsynchronizowany z botem" }, { status: 404 });
  }

  return NextResponse.json(guild.settings);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Brak autoryzacji" }, { status: 401 });
  }

  const { guildId } = await ctx.params;
  if (!(await assertGuildAccess(session.user.id, guildId))) {
    return NextResponse.json({ error: "Brak dostępu do serwera" }, { status: 403 });
  }

  const guild = await prisma.guild.findUnique({
    where: { discordId: guildId },
    include: { settings: true },
  });

  if (!guild?.settings) {
    return NextResponse.json({ error: "Serwer nie jest jeszcze zsynchronizowany z botem" }, { status: 404 });
  }

  const body = (await req.json()) as {
    moderationEnabled?: boolean;
    modLogChannelId?: string | null;
    moderatorRoleId?: string | null;
    muteDefaultMinutes?: number;
    locale?: string;
  };

  const updated = await prisma.guildSettings.update({
    where: { guildId: guild.id },
    data: {
      moderationEnabled: body.moderationEnabled,
      modLogChannelId: body.modLogChannelId,
      moderatorRoleId: body.moderatorRoleId,
      muteDefaultMinutes: body.muteDefaultMinutes,
      locale: body.locale ?? "pl",
    },
  });

  return NextResponse.json(updated);
}

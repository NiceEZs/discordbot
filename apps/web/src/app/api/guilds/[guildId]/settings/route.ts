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

function snowflakeOrNull(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{17,20}$/.test(trimmed)) return undefined;
  return trimmed;
}

function boolOrUndef(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

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
    return NextResponse.json(
      { error: "Serwer nie jest jeszcze zsynchronizowany z botem" },
      { status: 404 },
    );
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
    return NextResponse.json(
      { error: "Serwer nie jest jeszcze zsynchronizowany z botem" },
      { status: 404 },
    );
  }

  const body = (await req.json()) as Record<string, unknown>;

  const modLogChannelId = snowflakeOrNull(body.modLogChannelId);
  const moderatorRoleId = snowflakeOrNull(body.moderatorRoleId);
  const welcomeChannelId = snowflakeOrNull(body.welcomeChannelId);
  const goodbyeChannelId = snowflakeOrNull(body.goodbyeChannelId);

  if (
    body.modLogChannelId !== undefined &&
    modLogChannelId === undefined
  ) {
    return NextResponse.json(
      { error: "Nieprawidłowe ID kanału logów" },
      { status: 400 },
    );
  }
  if (
    body.moderatorRoleId !== undefined &&
    moderatorRoleId === undefined
  ) {
    return NextResponse.json(
      { error: "Nieprawidłowe ID roli moderatorskiej" },
      { status: 400 },
    );
  }
  if (
    body.welcomeChannelId !== undefined &&
    welcomeChannelId === undefined
  ) {
    return NextResponse.json(
      { error: "Nieprawidłowe ID kanału welcome" },
      { status: 400 },
    );
  }
  if (
    body.goodbyeChannelId !== undefined &&
    goodbyeChannelId === undefined
  ) {
    return NextResponse.json(
      { error: "Nieprawidłowe ID kanału goodbye" },
      { status: 400 },
    );
  }

  let muteDefaultMinutes: number | undefined;
  if (body.muteDefaultMinutes !== undefined) {
    const n = Number(body.muteDefaultMinutes);
    if (!Number.isFinite(n) || n < 1 || n > 40320) {
      return NextResponse.json(
        { error: "muteDefaultMinutes musi być w zakresie 1–40320" },
        { status: 400 },
      );
    }
    muteDefaultMinutes = Math.floor(n);
  }

  const textOrNull = (value: unknown): string | null | undefined => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== "string") return undefined;
    const t = value.trim();
    return t.length ? t.slice(0, 2000) : null;
  };

  const welcomeMessage = textOrNull(body.welcomeMessage);
  const goodbyeMessage = textOrNull(body.goodbyeMessage);
  if (body.welcomeMessage !== undefined && welcomeMessage === undefined) {
    return NextResponse.json(
      { error: "Nieprawidłowy szablon welcome" },
      { status: 400 },
    );
  }
  if (body.goodbyeMessage !== undefined && goodbyeMessage === undefined) {
    return NextResponse.json(
      { error: "Nieprawidłowy szablon goodbye" },
      { status: 400 },
    );
  }

  const updated = await prisma.guildSettings.update({
    where: { guildId: guild.id },
    data: {
      moderationEnabled: boolOrUndef(body.moderationEnabled),
      moderatorRoleId,
      muteDefaultMinutes,
      locale:
        typeof body.locale === "string" && body.locale.trim()
          ? body.locale.trim().slice(0, 8)
          : "pl",
      loggingEnabled: boolOrUndef(body.loggingEnabled),
      modLogChannelId,
      logModActions: boolOrUndef(body.logModActions),
      logMemberJoin: boolOrUndef(body.logMemberJoin),
      logMemberLeave: boolOrUndef(body.logMemberLeave),
      logBans: boolOrUndef(body.logBans),
      logChannels: boolOrUndef(body.logChannels),
      logRoles: boolOrUndef(body.logRoles),
      welcomeEnabled: boolOrUndef(body.welcomeEnabled),
      welcomeChannelId,
      welcomeMessage,
      goodbyeEnabled: boolOrUndef(body.goodbyeEnabled),
      goodbyeChannelId,
      goodbyeMessage,
    },
  });

  return NextResponse.json(updated);
}

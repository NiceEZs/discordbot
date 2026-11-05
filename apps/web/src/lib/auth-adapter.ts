import type {
  Adapter,
  AdapterAccount,
  AdapterUser,
  AdapterSession,
} from "next-auth/adapters";
import { prisma } from "@nice-hvh/db";

function toAdapterUser(user: {
  id: string;
  username: string;
  email: string | null;
  avatar: string | null;
}): AdapterUser {
  return {
    id: user.id,
    name: user.username,
    email: user.email ?? "",
    emailVerified: null,
    image: user.avatar,
  };
}

/**
 * Minimalny adapter Prisma pod nasz model User (discordId wymagany).
 * Nie używamy @next-auth/prisma-adapter bezpośrednio — nasze pole discordId
 * nie jest w domyślnym schemacie Auth.js.
 */
export function PrismaAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      const discordId =
        (data as AdapterUser & { discordId?: string }).discordId ??
        `pending_${Date.now()}`;
      const user = await prisma.user.create({
        data: {
          discordId,
          username: data.name ?? "unknown",
          email: data.email || null,
          avatar: data.image,
        },
      });
      return toAdapterUser(user);
    },
    async getUser(id: string) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return toAdapterUser(user);
    },
    async getUserByEmail(email: string) {
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) return null;
      return toAdapterUser(user);
    },
    async getUserByAccount({
      provider,
      providerAccountId,
    }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
        include: { user: true },
      });
      if (!account) return null;
      return toAdapterUser(account.user);
    },
    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const user = await prisma.user.update({
        where: { id: data.id },
        data: {
          username: data.name ?? undefined,
          email: data.email || undefined,
          avatar: data.image ?? undefined,
        },
      });
      return toAdapterUser(user);
    },
    async linkAccount(account: AdapterAccount) {
      if (account.provider === "discord") {
        await prisma.user.update({
          where: { id: account.userId },
          data: { discordId: account.providerAccountId },
        });
      }
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state as string | undefined,
        },
      });
      return account;
    },
    async createSession(session: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }) {
      const created = await prisma.session.create({
        data: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
      });
      return {
        sessionToken: created.sessionToken,
        userId: created.userId,
        expires: created.expires,
      } satisfies AdapterSession;
    },
    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      return {
        session: {
          sessionToken: session.sessionToken,
          userId: session.userId,
          expires: session.expires,
        },
        user: toAdapterUser(session.user),
      };
    },
    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">,
    ) {
      const updated = await prisma.session.update({
        where: { sessionToken: session.sessionToken },
        data: {
          expires: session.expires,
          userId: session.userId,
        },
      });
      return {
        sessionToken: updated.sessionToken,
        userId: updated.userId,
        expires: updated.expires,
      } satisfies AdapterSession;
    },
    async deleteSession(sessionToken: string) {
      await prisma.session.deleteMany({ where: { sessionToken } });
    },
  };
}

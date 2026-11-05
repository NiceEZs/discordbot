import type { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { PrismaAdapter } from "./auth-adapter";
import { prisma } from "@nice-hvh/db";

const scopes = ["identify", "email", "guilds"].join(" ");

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
      // Discord returns RFC 9207 `iss=https://discord.com` on the callback.
      // openid-client (next-auth v4) requires issuer metadata or it throws
      // OAUTH_CALLBACK_ERROR: "issuer must be configured on the issuer".
      issuer: "https://discord.com",
      authorization: { params: { scope: scopes } },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: profile.avatar
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : null,
          discordId: profile.id,
          username: profile.username,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { discordId: true, username: true },
        });
        session.user.discordId = dbUser?.discordId ?? "";
        session.user.username = dbUser?.username ?? session.user.name ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

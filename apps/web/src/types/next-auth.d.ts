import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId: string;
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    discordId?: string;
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId?: string;
  }
}

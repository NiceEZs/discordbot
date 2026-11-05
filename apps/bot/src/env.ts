import { config } from "dotenv";
import { resolve } from "node:path";

// Root monorepo .env (gdy uruchamiane z apps/bot lub root)
config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Brak wymaganej zmiennej środowiskowej: ${name}`);
  }
  return value;
}

export const env = {
  discordToken: () => required("DISCORD_TOKEN"),
  discordClientId: () => required("DISCORD_CLIENT_ID"),
  databaseUrl: () => required("DATABASE_URL"),
};

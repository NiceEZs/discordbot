import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

/** Load monorepo root `.env` (and optional local override) regardless of cwd. */
function loadEnvFiles(): void {
  const candidates = [
    resolve(__dirname, "../../../.env"), // src/ → repo root
    resolve(__dirname, "../../.env"), // dist/ → repo root
    resolve(process.cwd(), "../../.env"),
    resolve(process.cwd(), ".env"),
  ];

  const seen = new Set<string>();
  for (const path of candidates) {
    if (seen.has(path) || !existsSync(path)) continue;
    seen.add(path);
    config({ path });
  }

  // Local override last (apps/bot/.env)
  const local = resolve(process.cwd(), ".env");
  if (!seen.has(local) && existsSync(local)) {
    config({ path: local, override: true });
  }
}

loadEnvFiles();

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

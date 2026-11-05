import { REST, Routes } from "discord.js";
import { env } from "./env";
import { commands } from "./commands";

async function main() {
  const token = env.discordToken();
  const clientId = env.discordClientId();

  const body = commands.map((c) => c.data.toJSON());
  const rest = new REST({ version: "10" }).setToken(token);

  console.log(`[bot] Rejestruję ${body.length} komend slash...`);
  await rest.put(Routes.applicationCommands(clientId), { body });
  console.log("[bot] Komendy zarejestrowane globalnie.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

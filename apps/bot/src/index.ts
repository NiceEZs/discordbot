import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
} from "discord.js";
import { env } from "./env";
import { commandMap, type Command } from "./commands";
import { onReady } from "./events/ready";
import { onGuildCreate } from "./events/guildCreate";

// Phase 2+: leveling, tickets, automod, logging
// Phase 3: music — nie implementować w MVP
//
// MVP slash moderation only needs Guilds. Do NOT request privileged intents
// (GuildMembers / MessageContent) unless they are also enabled in the Discord
// Developer Portal — otherwise the gateway closes with "Used disallowed intents".
// Member lookups for /warn /mute /kick /ban use REST fetch-by-id and work without
// Server Members Intent.

async function main() {
  env.databaseUrl();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  const commands = new Collection<string, Command>();
  for (const [name, cmd] of commandMap) {
    commands.set(name, cmd);
  }

  client.once(Events.ClientReady, async () => {
    await onReady(client);
  });

  client.on(Events.GuildCreate, onGuildCreate);

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[bot] Błąd komendy /${interaction.commandName}:`, err);
      const payload = {
        content: "Wystąpił błąd podczas wykonywania komendy.",
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => undefined);
      } else {
        await interaction.reply(payload).catch(() => undefined);
      }
    }
  });

  await client.login(env.discordToken());
}

main().catch((err) => {
  console.error("[bot] Fatal:", err);
  process.exit(1);
});

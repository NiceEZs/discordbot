import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import { env } from "./env";
import { commandMap, type Command } from "./commands";
import { onReady } from "./events/ready";
import { onGuildCreate } from "./events/guildCreate";
import { onGuildMemberAdd } from "./events/guildMemberAdd";
import { onGuildMemberRemove } from "./events/guildMemberRemove";
import { registerLoggingEvents } from "./events/loggingEvents";

// Phase 2: logging + welcome/goodbye (wymaga Server Members Intent w Portalu)
// Phase 2b+: reaction roles, custom commands
// Phase 3: music
//
// GuildMembers is privileged — enable "Server Members Intent" in Discord
// Developer Portal → Bot before starting, or the gateway closes with
// "Used disallowed intents".

async function main() {
  env.databaseUrl();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.GuildMember],
  });

  const commands = new Collection<string, Command>();
  for (const [name, cmd] of commandMap) {
    commands.set(name, cmd);
  }

  client.once(Events.ClientReady, async () => {
    await onReady(client);
  });

  client.on(Events.GuildCreate, onGuildCreate);
  client.on(Events.GuildMemberAdd, onGuildMemberAdd);
  client.on(Events.GuildMemberRemove, onGuildMemberRemove);
  registerLoggingEvents(client);

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

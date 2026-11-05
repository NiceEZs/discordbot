import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import * as warn from "./warn";
import * as mute from "./mute";
import * as kick from "./kick";
import * as ban from "./ban";
import * as cases from "./cases";

export type Command = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

export const commands: Command[] = [warn, mute, kick, ban, cases];

export const commandMap = new Map(
  commands.map((c) => [c.data.name, c] as const),
);

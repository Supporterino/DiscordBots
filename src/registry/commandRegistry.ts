import { SlashCommandBuilder } from '@discordjs/builders';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/rest/v9';
import { genID, logger } from '../utils';

export class CommandRegistry {
  private __store: Map<string, RESTPostAPIApplicationCommandsJSONBody>;
  private __id: string;

  constructor() {
    this.__id = genID();
    this.__store = new Map<string, RESTPostAPIApplicationCommandsJSONBody>();
    logger.info(`Created new PrivateChannelRegistry with id (${this.__id}).`);
    this.init();
  }

  /**
   * Initializes the CommandRegistry with the predefined commands
   */
  private init() {
    this.addCommand('renameVoting', new SlashCommandBuilder().setName('vote').setDescription('Trigger a renaming vote').toJSON());
    this.addCommand(
      'triggerRename',
      new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Triggers a rename of all users and roles')
        .addStringOption((option) => option.setName('name').setDescription('The new name for everything on the discord').setRequired(false))
        .toJSON()
    );

    this.addCommand(
      'privateChannelCreate',
      new SlashCommandBuilder()
        .setName('create_private_channel')
        .setDescription('Creates a private Channel for your user')
        .addStringOption((option) => option.setName('channelname').setDescription('Desired name for the channel').setRequired(false))
        .addUserOption((option) => option.setName('user1').setDescription('User to move with you').setRequired(false))
        .addUserOption((option) => option.setName('user2').setDescription('User to move with you').setRequired(false))
        .addUserOption((option) => option.setName('user3').setDescription('User to move with you').setRequired(false))
        .toJSON()
    );

    this.addCommand(
      'moveHere',
      new SlashCommandBuilder()
        .setName('move_here')
        .setDescription('Move up to 3 users to your active voice channel.')
        .addUserOption((option) => option.setName('user1').setDescription('User to move with you').setRequired(true))
        .addUserOption((option) => option.setName('user2').setDescription('User to move with you').setRequired(false))
        .addUserOption((option) => option.setName('user3').setDescription('User to move with you').setRequired(false))
        .toJSON()
    );
  }

  /**
   * Adds a command defintion to the registry
   * @param name The name to identify the command
   * @param command The command definiton object
   */
  addCommand(name: string, command: RESTPostAPIApplicationCommandsJSONBody): void {
    this.__store.set(name, command);
  }

  /**
   * Check if the Registry has the requested command
   * @param name The name of the command to check
   * @returns Boolean indicating if the command is present
   */
  hasCommand(name: string): boolean {
    return this.__store.has(name);
  }

  /**
   * Retrieve a command from the registry by name.
   * @param name The name of the command to retrieve from the registry
   * @returns The ApplicationCommandData of the command
   */
  getCommandData(name: string): RESTPostAPIApplicationCommandsJSONBody {
    return this.__store.get(name)!;
  }
}

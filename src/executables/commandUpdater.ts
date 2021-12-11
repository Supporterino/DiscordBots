import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';
import { Executable } from '.';
import { CommandRegistry } from '../registry';
import { logger } from '../utils';

/**
 * This class is a simple wrapper around a REST Client to update your slashcommands at the discord API.
 */
export class Updater implements Executable {
  private __commandRegistry!: CommandRegistry;
  private __token: string;
  private __id: string;
  private __client!: REST;
  private __commands: Array<string>;
  private __guild_id: string;

  /**
   * Initialize a new CommandUpdater
   * @param tok Application token
   * @param id Application ID
   * @param guildID Guild ID in which to update the commands
   */
  constructor(tok: string, id: string, guildID: string) {
    this.__token = tok;
    this.__id = id;
    this.__guild_id = guildID;
    this.__commands = new Array<string>();
    logger.info(`Initialized new CommandUpdater for application(${this.__id}) on guild(${this.__guild_id})`);
  }

  /**
   * This functions starts the update process of the slashcommands by creating a CommandRegistry and a REST Client to send the request to the Discord API
   */
  start(): void {
    this.__commandRegistry = new CommandRegistry();
    this.__client = new REST({ version: '9' }).setToken(this.__token);
    this.__commands.push('privateChannelCreate', 'moveHere', 'triggerRename', 'renameVoting');
    this.update();
  }

  /**
   * This function iterates over the commands in the CommandRegistry and posts the reuqest to the Discord API through the REST Client
   */
  async update(): Promise<void> {
    try {
      logger.info('Updating Slash Commands');
      const to_register = [];
      for (const command of this.__commands) {
        if (!this.__commandRegistry.hasCommand(command)) logger.prettyError(new Error(`Command not present in registry ${command}`));
        to_register.push(this.__commandRegistry.getCommandData(command));
      }
      await this.__client.put(Routes.applicationGuildCommands(this.__id, this.__guild_id), {
        body: to_register
      });
      logger.info('Finished updating Slash Commands');
    } catch (error) {
      logger.prettyError(<Error>error);
    }
  }
}

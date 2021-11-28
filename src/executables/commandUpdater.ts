import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/rest/v9';
import { Executable } from '.';
import { CommandRegistry } from '../registry';
import { logger } from '../utils';

export class Updater implements Executable {
  private __commandRegistry!: CommandRegistry;
  private __token: string;
  private __id: string;
  private __client!: REST;
  private __commands: Array<string>;
  private __guild_id: string = '354698351024930837';

  constructor(tok: string, id: string) {
    this.__token = tok;
    this.__id = id;
    this.__commands = new Array<string>();
  }

  start(): void {
    this.__commandRegistry = new CommandRegistry();
    this.__client = new REST({ version: '9' }).setToken(this.__token);
    this.__commands.push('privateChannelCreate', 'moveHere', 'triggerRename');
    this.update();
  }

  async update(): Promise<void> {
    try {
      logger.info('Updating Slash Commands');
      const to_register = []
      for (const command of this.__commands) {
        if (!this.__commandRegistry.hasCommand(command)) logger.prettyError(new Error(`Command not present in registry ${command}`));
        to_register.push(this.__commandRegistry.getCommandData(command));        
      }
      await this.__client.put(Routes.applicationGuildCommands(this.__id, this.__guild_id), {
        body: to_register
      });
      logger.info('Finished updating Slash Commands');
    } catch (error) {
      logger.prettyError(<Error> error);
    }
  }
}

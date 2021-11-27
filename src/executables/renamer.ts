import { ApplicationCommandData, Client, Intents } from 'discord.js';
import { Executable } from '.';
import { CommandRegistry } from '../registry';
import { logger } from '../utils';

export class Renamer implements Executable {
  private __token: string;
  private __commandRegistry!: CommandRegistry;
  private __client!: Client;

  constructor(tok: string) {
    this.__token = tok;
  }

  start(): void {
    this.__commandRegistry = new CommandRegistry();
    this.createClient();
    this.registerEventHandler();
    this.registerCommands(['triggerRename']);
    this.__client.login(this.__token);
  }

  /**
   * Creates the discord API client
   */
  private createClient(): void {
    this.__client = new Client({
      presence: {
        status: 'online',
        activities: [
          {
            name: 'serve your commands.',
            type: 'LISTENING'
          }
        ]
      },
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_WEBHOOKS
      ]
    });
  }

  /**
   * Register the client event handlers
   */
  private registerEventHandler(): void {
    this.__client.on('ready', () => {
      if (this.__client.user) logger.info(`Logged in as ${this.__client.user.tag}`);
      else logger.warn(`Client wasn't logged in correctly and didn't get a user object.`);
    });

    this.__client.ws.on('INTERACTION_CREATE', async (interaction: any) => {
      if (interaction.type == '2') {
      } else {
        logger.warn(`Received interaction isn't a command. Type is ${interaction.type}`);
      }
    });
  }

  /**
   * Gets the CommandData from the CommandRegistry and registers the commands at the discord API
   * @param commands The commands to create
   */
  private registerCommands(commands: Array<string>): void {
    let commandsToRegister = new Array<ApplicationCommandData>();

    for (const commandName of commands) {
      if (this.__commandRegistry.hasCommand(commandName)) commandsToRegister.push(this.__commandRegistry.getCommandData(commandName));
      else logger.warn(`Tried to recieve a command from the regitry which isn't present. Name: ${commandName}`);
    }

    this.__client.once('ready', () => {
      commandsToRegister.forEach((data: ApplicationCommandData) => {
        if (this.__client.application) this.__client.application.commands.create(data);
        else logger.warn(`The application object of the client isn't present.`);
      });
    });
  }
}

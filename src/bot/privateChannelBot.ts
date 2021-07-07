import { ApplicationCommandData, Client, CommandInteraction, Intents } from 'discord.js';
import { CommandRegistry, PrivateChannelRegistry } from '@/registry';
import { logger } from '@/utils';
import { ChannelRequest } from '@/requests';
export class PrivateChannelBot {
  private __token: string;
  private __channelRegistry: PrivateChannelRegistry;
  private __commandRegistry: CommandRegistry;
  private __client: Client;

  constructor(tok: string) {
    this.__token = tok;
  }

  /**
   * Start the bot by creating all necessary components and logging in to discord API
   */
  public start(): void {
    this.__channelRegistry = new PrivateChannelRegistry();
    this.__commandRegistry = new CommandRegistry();
    this.createClient();
    this.registerEventHandler();
    this.registerCommands(['privateChannelCreate']);
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
            name: 'Waiting to serve your requests',
            type: 'LISTENING'
          }
        ]
      },
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS,
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
      logger.info(`Logged in as ${this.__client.user.tag}`);
    });

    this.__client.ws.on('INTERACTION_CREATE', async (interaction: any) => {
      if (interaction.type == '2') {
        const command = new CommandInteraction(this.__client, interaction);
        this.handleCommand(command);
      } else {
        logger.warn(`Received interaction isn't a command. Type is ${interaction.type}`);
      }
    });
  }

  /**
   * Checks the command name of the CommandInteraction and distributes the command to the right wrapper
   * @param cmd the recieved CommandInteraction
   */
  private handleCommand(cmd: CommandInteraction): void {
    if (cmd.commandName === 'privateChannelCreate') {
      this.handlePrivateChannelCommand(cmd);
    }
  }

  /**
   * Create a ChannelReuest and executes it
   * @param cmd The initiating CommandInteraction
   */
  private handlePrivateChannelCommand(cmd: CommandInteraction): void {
    const request = new ChannelRequest(cmd);
    request.extractInformation();
    if (this.__channelRegistry.available(request.channelName)) {
      this.__channelRegistry.addChannelToRegistry(request.channelName, request.OwnerName);
      request.execute();
    } else request.declineRequest(`ChannelName already in use.`);
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
        this.__client.application.commands.create(data);
      });
    });
  }
}

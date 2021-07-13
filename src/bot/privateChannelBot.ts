import { ApplicationCommandData, Client, CommandInteraction, Intents, VoiceState } from 'discord.js';
import { CommandRegistry, PrivateChannelRegistry } from '../registry';
import { logger } from '../utils';
import { ChannelRequest, VoiceStateUpdate } from '../requests';
export class PrivateChannelBot {
  private __token: string;
  private __channelRegistry!: PrivateChannelRegistry;
  private __commandRegistry!: CommandRegistry;
  private __client!: Client;

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
      if (this.__client.user) logger.info(`Logged in as ${this.__client.user.tag}`);
      else logger.warn(`Client wasn't logged in correctly and didn't get a user object.`);
    });

    this.__client.ws.on('INTERACTION_CREATE', async (interaction: any) => {
      if (interaction.type == '2') {
        const command = new CommandInteraction(this.__client, interaction);
        this.handleCommand(command);
      } else {
        logger.warn(`Received interaction isn't a command. Type is ${interaction.type}`);
      }
    });

    this.__client.on('voiceStateUpdate', async (vs: VoiceState) => {
      this.handleVoiceStateUpdate(vs);
    });
  }

  /**
   * Handle VoiceStateUpdate and delete channel if owner leaves it
   * @param vs The VoiceState event
   */
  private handleVoiceStateUpdate(vs: VoiceState): void {
    const event = new VoiceStateUpdate(vs);
    if (this.__channelRegistry.checkOwnerMatch(event.ChannelName, event.OwnerName)) {
      event.deleteChannel();
      if (!this.__channelRegistry.deleteChannelEntry(event.ChannelName))
        logger.warn(`Couldn't delete channel (${event.ChannelName}) from PrivateChannelRegistry.`);
    }
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
        if (this.__client.application) this.__client.application.commands.create(data);
        else logger.warn(`The application object of the client isn't present.`)
      });
    });
  }
}

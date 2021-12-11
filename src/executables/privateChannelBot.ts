import { Client, CommandInteraction, Intents, Interaction, VoiceState } from 'discord.js';
import { PrivateChannelRegistry } from '../registry';
import { EnvLoader, logger } from '../utils';
import { ChannelRequest, MoveRequest, RenameRequest, VoiceStateUpdate, VotingProcedure } from '../requests';
import { Executable } from '.';
export class PrivateChannelBot implements Executable {
  private __token: string;
  private __channelRegistry!: PrivateChannelRegistry;
  private __client!: Client;
  private __lastNameVoting: Date;
  private __loader: EnvLoader;

  constructor(tok: string, envloader: EnvLoader) {
    this.__token = tok;
    this.__loader = envloader;
    this.__lastNameVoting = new Date('1995-12-17T03:24:00');
  }

  /**
   * Start the bot by creating all necessary components and logging in to discord API
   */
  public start(): void {
    this.__channelRegistry = new PrivateChannelRegistry();
    this.createClient();
    this.registerEventHandler();
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
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_MEMBERS
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

    this.__client.on('interactionCreate', async (interaction: Interaction) => {
      if (interaction.isCommand()) {
        this.handleCommand(<CommandInteraction>interaction);
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
    if (event.doable() && this.__channelRegistry.checkOwnerMatch(event.ChannelName, event.OwnerName)) {
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
    switch (cmd.commandName) {
      case 'create_private_channel':
        this.handlePrivateChannelCommand(cmd);
        break;
      case 'move_here':
        this.handleMoveHereCommand(cmd);
        break;
      case 'rename':
        this.handleRenameCommand(cmd);
        break;
      case 'vote':
        this.handleVoteCommand(cmd);
        break;
      default:
        break;
    }
  }

  private handleVoteCommand(cmd: CommandInteraction): void {
    const now = new Date();
    if (Math.abs(this.__lastNameVoting.getTime() - now.getTime()) > <number>(<unknown>this.__loader.getVariable('VotingTimeout'))) {
      const request = new VotingProcedure(cmd, <number>(<unknown>this.__loader.getVariable('VotingTime')));
      request.extractInformation();
      request.execute();
      this.__lastNameVoting = now;
    } else {
      cmd.reply({
        ephemeral: true,
        content: `Last vote was on ${this.__lastNameVoting.toUTCString()}. Next vote possible on ${new Date(
          this.__lastNameVoting.getTime() + <number>(<unknown>this.__loader.getVariable('VotingTimeout'))
        ).toUTCString()}`
      });
    }
  }

  private handleRenameCommand(cmd: CommandInteraction): void {
    const request = new RenameRequest(cmd);
    request.extractInformation();
    request.execute();
  }

  /**
   * Creates a MoveRequest and executes it
   * @param cmd The initiating CommandInteraction
   */
  private handleMoveHereCommand(cmd: CommandInteraction): void {
    const request = new MoveRequest(cmd);
    request.extractInformation();
    request.execute();
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
}

import { Client, CommandInteraction, Intents, Interaction, VoiceState } from 'discord.js';
import { PrivateChannelRegistry } from '../registry';
import { EnvLoader, getRandomTimezone, logger } from '../utils';
import { ChannelRequest, MoveRequest, RenameRequest, VoiceStateUpdate, VotingProcedure } from '../requests';
import { Executable } from '.';
import { PermissionHandler } from './permissionHandler';
/**
 * This class is the main bot which is launched and logs into the desired servers. The class mostly initializes the discord.js client and handles the distribution of various events and task to sub classes.
 */
export class TheBot implements Executable {
  private __token: string;
  private __channelRegistry!: PrivateChannelRegistry;
  private __client!: Client;
  private __lastNameVoting: Date;
  private __loader: EnvLoader;
  private __permissionHandler: PermissionHandler;

  /**
   * Initialize a new bot
   * @param tok Application Token to access discord API
   * @param envloader an intialized env variable loader to get the needed config parameters
   * @param permissionHandler an ready to use PermissionHandler instance
   */
  constructor(tok: string, envloader: EnvLoader, permissionHandler: PermissionHandler) {
    this.__token = tok;
    this.__loader = envloader;
    this.__permissionHandler = permissionHandler;
    this.__lastNameVoting = new Date('1995-12-17T03:24:00');
    logger.info(`Initialized new main bot class`);
  }

  /**
   * Start the bot by creating all necessary components and logging in to discord API
   */
  public start(): void {
    logger.debug(`Starting bot by building sub classes and registering client`);
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
    logger.debug(`Registering event handler for discord.js client`);
    this.__client.on('ready', () => {
      if (this.__client.user) logger.info(`Logged in as ${this.__client.user.tag}`);
      else logger.warn(`Client wasn't logged in correctly and didn't get a user object.`);
    });

    this.__client.on('interactionCreate', async (interaction: Interaction) => {
      if (interaction.isCommand()) {
        this.handleCommand(<CommandInteraction>interaction);
      } else if (interaction.isButton()) {
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
    logger.debug(`Handling VoiceStateUpdate`);
    const event = new VoiceStateUpdate(vs);
    if (event.doable() && this.__channelRegistry.checkOwnerMatch(event.ChannelName, event.OwnerName)) {
      logger.debug(`Deleting private channel since owner left`);
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
    logger.debug(`Got CommandInteraction with command: ${cmd.commandName}`);
    switch (cmd.commandName) {
      case 'create_private_channel':
        if (this.__permissionHandler.checkRight(cmd.user.id, cmd.commandName)) this.handlePrivateChannelCommand(cmd);
        else
          cmd.reply({
            ephemeral: true,
            content: `You have no access to this command.`
          });
        break;
      case 'move_here':
        if (this.__permissionHandler.checkRight(cmd.user.id, cmd.commandName)) this.handleMoveHereCommand(cmd);
        else
          cmd.reply({
            ephemeral: true,
            content: `You have no access to this command.`
          });
        break;
      case 'rename':
        if (this.__permissionHandler.checkRight(cmd.user.id, cmd.commandName)) this.handleRenameCommand(cmd);
        else
          cmd.reply({
            ephemeral: true,
            content: `You have no access to this command.`
          });
        break;
      case 'vote':
        if (this.__permissionHandler.checkRight(cmd.user.id, cmd.commandName)) this.handleVoteCommand(cmd);
        else
          cmd.reply({
            ephemeral: true,
            content: `You have no access to this command.`
          });
        break;
      default:
        break;
    }
  }

  /**
   * This function handles the execution of a server rename vote. It checks if a vote is allowed and then executes it
   * @param cmd The CommandInteraction triggering the vote
   */
  private handleVoteCommand(cmd: CommandInteraction): void {
    const now = new Date();
    const timezone = getRandomTimezone();
    logger.info('Timezone: ', timezone);
    const formatter = new Intl.DateTimeFormat('en-GB', {
      localeMatcher: 'best fit',
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'long',
      timeZone: timezone
    });
    logger.info(`Checking if a voting procedure can be done`);
    if (Math.abs(this.__lastNameVoting.getTime() - now.getTime()) > +this.__loader.getVariable('VoteTimeout')) {
      logger.debug(`Starting voting procedure`);
      const request = new VotingProcedure(
        cmd,
        <number>(<unknown>this.__loader.getVariable('VoteTime')),
        formatter.format(now.getTime() + +this.__loader.getVariable('VoteTimeout'))
      );
      request.extractInformation();
      request.execute();
      this.__lastNameVoting = now;
    } else {
      const next = new Date(this.__lastNameVoting.getTime() + +this.__loader.getVariable('VoteTimeout'));
      logger.warn(`Vote request was called too early. Possible on ${next.toUTCString()}`);
      cmd.reply({
        ephemeral: true,
        content: `Last vote was on ${formatter.format(this.__lastNameVoting)}. Next vote possible on ${formatter.format(next)}`
      });
    }
  }

  /**
   * This function handles the trigger of a rename command and executes the request on the server
   * @param cmd The CommandInteraction triggering the vote
   */
  private handleRenameCommand(cmd: CommandInteraction): void {
    logger.debug(`Received rename. Executing it`);
    const request = new RenameRequest(cmd);
    request.extractInformation();
    request.execute();
  }

  /**
   * Creates a MoveRequest and executes it
   * @param cmd The initiating CommandInteraction
   */
  private handleMoveHereCommand(cmd: CommandInteraction): void {
    logger.debug(`Received move request. Executing it`);
    const request = new MoveRequest(cmd);
    request.extractInformation();
    request.execute();
  }

  /**
   * Create a ChannelReuest and executes it
   * @param cmd The initiating CommandInteraction
   */
  private handlePrivateChannelCommand(cmd: CommandInteraction): void {
    logger.debug(`Received private channel request. Executing it`);
    const request = new ChannelRequest(cmd);
    request.extractInformation();
    if (this.__channelRegistry.available(request.channelName)) {
      this.__channelRegistry.addChannelToRegistry(request.channelName, request.OwnerName);
      request.execute();
    } else request.declineRequest(`ChannelName already in use.`);
  }
}

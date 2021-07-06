import {
  Message,
  Guild,
  VoiceChannel,
  GuildMember,
  Client,
  StageChannel,
  CommandInteraction,
  User
} from 'discord.js';
import { Logger, TLogLevelName } from 'tslog';
import { compTwoStringsInsensitive } from '../utils/basicUtils';

export class BasicBot {
  protected logger: Logger = null;
  protected client: Client = null;
  private loglevel = process.env.LOG_LEVEL || 'silly';

  constructor() {
    this.createLog();
  }

  /**
   * Creates the logger for the Bots.
   */
  createLog() {
    this.logger = new Logger({
      name: 'wizard_backend',
      minLevel: this.loglevel as TLogLevelName,
      dateTimeTimezone: 'Europe/Berlin'
    });
  }

  /**
   * Return the first mentioned user in a command.
   * @param msg Recieved message with command
   * @return The GuildMember object of the referenced user
   */
  getSingleMention(msg: Message) {
    const temp = msg.guild.members.cache.find((user) => user.displayName.toString() === msg.mentions.users.first().username.toString());
    this.logger.debug(`Fetched target with name: ${temp.displayName.toString()}`);
    return temp;
  }

  /**
   * Extract the name of the author of a message
   * @param msg Message object to process
   * @return string with the name of the author
   */
  getNameOfAuthor(msg: Message | CommandInteraction) {
    if (msg instanceof Message) return msg.member.displayName.toString();
    if (msg instanceof CommandInteraction) return this.getGuildMember(msg).displayName.toString();
    else throw new Error(`You somehow managed to sneak a not type allowed parameter in here. ;)`)
  }

  /**
   * Extract the GuildMember from the CommandInteraction object
   * @param msg CommandInteraction object to process
   * @return Referenced GuildMember (owner of command)
   */
  getGuildMember(msg: CommandInteraction) {
    return msg.guild.members.cache.find((user) => user.id === msg.member.user.id);
  }

  /**
   * Extract the GuildMember from a given guild object by id
   * @param guild The guild obejct to search in
   * @param target The user object to get id from
   * @return Referenced GuildMember (owner of command)
   */
  getGuildMemberById(guild: Guild, target: User) {
    return guild.members.cache.find((user) => user.id === target.id);
  }

  /**
   * Change to GuildMembers VoiceChannel to the provided one.
   * @param target The GuildMember object whichs VoiceChannel should be changed
   * @param vc The target VoiceChannel object
   */
  setVoiceChannel(target: GuildMember, vc: VoiceChannel) {
    target.voice.setChannel(vc);
    this.logger.info(`Moved ${target.displayName.toString()} to ${vc.name.toString()}`);
  }

  /**
   * Finds a channel by name in the provided guild.
   * @param guild The active guild to the message
   * @param name The name of the channel to search
   * @return GuildChannel object
   */
  getChannelByName(guild: Guild, name: string) {
    return guild.channels.cache.find((channel) => compTwoStringsInsensitive(channel.name, name));
  }

  /**
   * Returns the VoiceChannel object of a givven channel name.
   * @param guild The active guild of a message
   * @param name The name of the channel to search
   * @return VoiceChannel object
   */
  getVChannelByName(guild: Guild, name: string) {
    return <VoiceChannel>this.getChannelByName(guild, name);
  }

  /**
   * This function extracts the active voice channel of the author of the command
   * @param msg recieved message with command
   * @return the VoiceChannel object
   */
  getVChannelOfAuthor(msg: CommandInteraction) {
    let temp: VoiceChannel | StageChannel = undefined;
    temp = this.getGuildMember(msg).voice.channel
    return temp;
  }

  /**
   * Checks if the author of the command is authorized to execute it.
   * @param msg recieved message with command
   * @return Boolean if the author is authorized
   */
  checkAuth(msg: Message) {
    const author = msg.guild.members.cache.find((user) => user.id === msg.author.id);
    let authorized = false;
    if (
      author.roles.cache.some((role) => compTwoStringsInsensitive(role.name, 'BotRights') || compTwoStringsInsensitive(role.name, 'ADMIN'))
    )
      authorized = true;
    this.logger.info(`Checked rights for user: ${author.displayName.toString()}. Result: ${authorized}`);
    return authorized;
  }
}

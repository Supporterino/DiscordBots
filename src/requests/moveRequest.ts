import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import { getGuildMemberByID, getVoiceChannelOfUser, logger, moveRequests, setVoiceChannel } from '../utils';

/**
 * The {@link MoveRequest} class extracts the targets to move from the command interaction and moves the to the owners channel
 */
export class MoveRequest {
  private __guild!: Guild;
  private __command: CommandInteraction;
  private __owner!: GuildMember;
  private __mentions: Array<GuildMember>;

  /**
   * Initialize a new {@link MoveRequest} with calling CommandInteraction
   * @param cmd The CommandInteraction starting the request
   */
  constructor(cmd: CommandInteraction) {
    this.__command = cmd;
    this.__mentions = new Array<GuildMember>();
    moveRequests.inc();
  }

  /**
   * This function extracts the initial information from a CommandInteraction
   */
  extractInformation(): void {
    if (this.__command.guild) this.__guild = this.__command.guild;
    else logger.error(new Error(`No Guild attached to request.`));
    this.__owner = getGuildMemberByID(this.__guild, this.__command.user.id);
    this.getMentionedUsers();
  }

  /**
   *  Start the execution of a {@link MoveRequest}
   */
  execute(): void {
    logger.info(`Executing MoveRequest`);
    const targetChannel = getVoiceChannelOfUser(this.__owner);
    if (targetChannel) {
      let reply = '';
      logger.debug(`Moving mentions to owners voice channel`);
      this.__mentions.forEach((user) => {
        if (!setVoiceChannel(user, targetChannel)) {
          reply += `${user.displayName} `;
        }
      });
      if (reply !== '') this.__command.reply(`Couldn't move the following users: ${reply}`);
      else this.__command.reply(`Movement completed.`);
    } else {
      this.__command.reply(`You aren't connected to voice. The command is canceled.`);
      logger.error(new Error(`The initiator(${this.__owner.displayName}) of the request isn't connected to Voice`));
    }
  }

  /**
   * Extracts the possible mentioned users from the CommandInteraction and stores them in a local array
   */
  private getMentionedUsers(): void {
    for (const mentionable of ['user1', 'user2', 'user3']) {
      let mentionedUser = this.__command.options.get(mentionable);
      if (mentionedUser !== null) {
        const mentionedGuildUser = getGuildMemberByID(this.__guild, mentionedUser.user!.id);
        if (mentionedGuildUser) this.__mentions.push(mentionedGuildUser);
      }
    }
  }
}

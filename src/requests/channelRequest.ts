import { channelRequests, createChannel, getChannelByName, getGuildMemberByID, logger, setVoiceChannel } from '../utils';
import { CommandInteraction, Guild, GuildChannelCreateOptions, GuildMember, VoiceChannel } from 'discord.js';

export class ChannelRequest {
  private __guild!: Guild;
  private __command: CommandInteraction;
  private __owner!: GuildMember;
  private __mentions: Array<GuildMember>;
  private __channelName!: string;

  constructor(cmd: CommandInteraction) {
    this.__command = cmd;
    this.__mentions = new Array<GuildMember>();
    channelRequests.inc();
  }

  /**
   * This function extracts the initial information from a CommandInteraction
   */
  extractInformation(): void {
    if (this.__command.guild) this.__guild = this.__command.guild;
    else logger.error(new Error(`No Guild attached to request.`));
    this.__owner = getGuildMemberByID(this.__guild, this.__command.user.id);
    if (this.__command.options) {
      this.getMentionedUsers();
      this.extractChannelName();
    } else logger.info(`The CommandInteraction of the ChannelRequest doesn't have a options collection.`);
  }

  /**
   * Start the execution of a PrivateChannelRequest
   */
  execute(): void {
    const parentChannel = getChannelByName(this.__guild, 'Private Channels');
    if (!parentChannel) logger.error(`The parent channel for privat channels wasn't found.`);

    const data: GuildChannelCreateOptions = {
      type: 2,
      parent: parentChannel,
      permissionOverwrites: [
        {
          id: this.__guild.id,
          deny: ['VIEW_CHANNEL']
        }
      ]
    };

    createChannel(this.__guild, this.__channelName, data).then((vc) => {
      if (setVoiceChannel(this.__owner, <VoiceChannel>vc)) {
        this.moveMentions(<VoiceChannel>vc);
        this.__command.reply(`Your channel has been created and you are moved to it with your mentions.`);
      }
      else logger.warn(`The owner (${this.__owner.displayName}) isn't connected to voice.`);
    });
  }

  /**
   * Move all mentioned users with the owner to the created VoiceChannel
   * @param vc The created VoiceChannel
   */
  private moveMentions(vc: VoiceChannel): void {
    if (this.__mentions.length > 0) {
      this.__mentions.forEach((user: GuildMember) => {
        if (!setVoiceChannel(user, vc))
          logger.info(`Couldn't move mention with owner, since ${user.displayName} isn't connected to voice.`);
      });
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

  /**
   * Extract the channel name from the CommandInteractionOption or create it from the owner's name
   */
  private extractChannelName(): void {
    let option = this.__command.options.get('channelname');
    if (option !== null) this.__channelName = option.value!.toString(); 
    else this.__channelName = `${this.__owner.displayName}'s Channel`;
  }

  /**
   * Declines the command with the provided reason
   * @param reason reason why execution was declined
   */
  declineRequest(reason: string): void {
    this.__command.reply(reason);
  }

  /**
   * Getter for planned channel name
   */
  get channelName(): string {
    return this.__channelName;
  }

  /**
   * Getter for owner of request
   */
  get OwnerName(): string {
    return this.__owner.displayName;
  }
}

import { getChannelByName, logger, setVoiceChannel, voiceStates } from '../utils';
import { Guild, GuildMember, VoiceChannel, VoiceState } from 'discord.js';

/**
 * This is an event handler for VoiceStateUpdate to check if a owner of a private channel leaves it. If so the channel is deleted and the channel removed from the {@link PrivateChannelRegistry}
 */
export class VoiceStateUpdate {
  private __state: VoiceState;
  private __guild!: Guild;
  private __owner!: GuildMember;
  private __channelName!: string;

  constructor(vs: VoiceState) {
    this.__state = vs;
    this.init();
    voiceStates.inc();
  }

  /**
   * Extracts all needed information from the VoiceState
   */
  private init(): void {
    this.__guild = this.__state.guild;
    if (this.__state.member) this.__owner = this.__state.member;
    else logger.debug(`Skipped a VoiceStateUpdate without a member`);
    if (this.__state.channel) this.__channelName = this.__state.channel.name;
    else logger.debug(`Skipped a VoiceStateUpdate without channel`);
  }

  /**
   * This function indicates if a VoiceStateUpdate is relevant and runable for the bot.
   * @returns true if runnable else false
   */
  doable(): boolean {
    if (this.__owner && this.__channelName) return true;
    else return false;
  }

  /**
   * Move all other member to AFK channel and delete channel
   */
  deleteChannel(): void {
    if (this.__state.channel!.members.size > 0) {
      logger.debug(`Moving other members of channel to AFK channel`);
      const afkChannel = getChannelByName(this.__guild, 'AFK');
      this.__state.channel!.members.forEach((user: GuildMember) => {
        setVoiceChannel(user, <VoiceChannel>afkChannel);
      });
      this.__state.channel!.delete();
    } else this.__state.channel!.delete();
  }

  /**
   * Getter for name of event owner
   */
  get OwnerName(): string {
    return this.__owner.id;
  }

  /**
   * Getter for name of affected channel
   */
  get ChannelName(): string {
    return this.__channelName;
  }
}

import { getChannelByName, logger, setVoiceChannel } from '../utils';
import { Guild, GuildMember, VoiceChannel, VoiceState } from 'discord.js';

export class VoiceStateUpdate {
  private __state: VoiceState;
  private __guild!: Guild;
  private __owner!: GuildMember;
  private __channelName!: string;

  constructor(vs: VoiceState) {
    this.__state = vs;
    this.init();
  }

  /**
   * Extracts all needed information from the VoiceState
   */
  private init(): void {
    this.__guild = this.__state.guild;
    if (this.__state.member) this.__owner = this.__state.member;
    else logger.error(new Error(`The VoiceState didn't have a member assosiated`));
    if (this.__state.channel) this.__channelName = this.__state.channel.name;
    else logger.error(new Error(`The VoiceState didn't have a channel assosiated`));
  }

  /**
   * Move all other member to AFK channel and delete channel
   */
  deleteChannel(): void {
    if (this.__state.channel!.members.size > 0) {
      const afkChannel = getChannelByName(this.__guild, 'AFK');
      this.__state.channel!.members.forEach((user: GuildMember) => {
        setVoiceChannel(user, <VoiceChannel>afkChannel);
      });
    }
    this.__state.channel!.delete();
  }

  /**
   * Getter for name of event owner
   */
  get OwnerName(): string {
    return this.__owner.displayName;
  }

  /**
   * Getter for name of affected channel
   */
  get ChannelName(): string {
    return this.__channelName;
  }
}

import {
  CategoryChannel,
  Guild,
  GuildChannel,
  GuildChannelCreateOptions,
  GuildMember,
  NewsChannel,
  Snowflake,
  StageChannel,
  StoreChannel,
  TextChannel,
  VoiceChannel
} from 'discord.js';
import { compTwoStringsInsensitive } from '../utils';

/**
 * Returns a GuildMember based on its ID from the guild
 * @param guild The guild to use
 * @param id The ID to search
 * @returns The requested GuildMember
 */
export const getGuildMemberByID = (guild: Guild, id: Snowflake): GuildMember => {
  if (guild.members.cache.has(id)) return guild.members.cache.get(id)!;
  else throw new Error(`The user (${id}) isn't present in this guild.`);
};

/**
 * Create a channel inside the provided guild with the given name and options
 * @param guild The guild to create the channel in
 * @param channelName The name of the channel to create
 * @param channelData The channel options
 * @returns A Promise resolving into the created channel
 */
export const createChannel = (
  guild: Guild,
  channelName: string,
  channelData: GuildChannelCreateOptions
): Promise<TextChannel | VoiceChannel | CategoryChannel | NewsChannel | StoreChannel | StageChannel> => {
  return guild.channels.create(channelName, channelData);
};

/**
 * This function returns a channel from a guild by name
 * @param guild The guild to search in
 * @param channelName The name of the channel
 */
export const getChannelByName = (guild: Guild, channelName: string): GuildChannel => {
  return <GuildChannel>guild.channels.cache.find((channel) => compTwoStringsInsensitive(channelName, channel.name));
};

/**
 * Moves a user to a desired VoiceChannel
 * @param user The user to move to a VoiceChannel
 * @param vc The target VoiceChannel
 * @returns boolean indecation if the move was successfull
 */
export const setVoiceChannel = (user: GuildMember, vc: VoiceChannel): boolean => {
  if (user.voice.channel) {
    user.voice.setChannel(vc);
    return true;
  } else return false;
};

/**
 * Extracts the VoiceChannel of a GuildMemer if it is present.
 * @param user The GuildMember to extract the Channel from
 * @returns The VoiceChannel of the user or undefined if user isn't connected to a VC
 */
export const getVoiceChannelOfUser = (user: GuildMember): VoiceChannel | undefined => {
  if (user.voice.channel) {
    return <VoiceChannel>user.voice.channel;
  } else {
    return undefined;
  }
};

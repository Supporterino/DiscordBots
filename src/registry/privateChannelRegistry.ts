import { genID, logger, activeChannels } from '../utils';

/**
 * This class is the store for a {@link ChannelRequest}. The PrivateChannelRegistry persists active channels and assosiates them with their owner.
 */
export class PrivateChannelRegistry {
  private __store: Map<String, String>;
  private __id: string;

  /**
   * Initialize a new PrivateChannelRegistry with a unique ID
   */
  constructor() {
    this.__id = genID();
    this.__store = new Map<string, string>();
    logger.info(`Created new PrivateChannelRegistry with id (${this.__id}).`);
  }

  /**
   * Check if a channel is free to register.
   * @param channelName The name of the channel to check.
   * @returns A boolean indecating true if the channel can be created.
   */
  available(channelName: string): boolean {
    logger.debug(`Checking if name(${channelName}) for private channel isn't in use`);
    return !this.__store.has(channelName);
  }

  /**
   * Add a channel to the PrivateChannelRegistry.
   * @param channelName Name of the channel to add.
   * @param owner The owner assosiated with the channel.
   */
  addChannelToRegistry(channelName: string, owner: string): void {
    logger.info(`Adding privateChannel(${channelName}) to the PrivateChannelRegistry`);
    this.__store.set(channelName, owner);
    activeChannels.set(this.__store.size);
  }

  /**
   * Check if the owner for a channel matches.
   * @param channelName The name of the channel to check.
   * @param ownerToCheck The potential owner of the channel.
   * @returns True if the owner matches and false if it doesn't or the channel isn't found. If channel isn't found a warning is raised.
   */
  checkOwnerMatch(channelName: string, ownerToCheck: string): boolean {
    logger.debug(`Checking if ${ownerToCheck} owns the private channel ${channelName}`);
    if (this.__store.has(channelName)) {
      const ownerOfChannel = this.__store.get(channelName);
      if (ownerOfChannel === ownerToCheck) return true;
      else return false;
    } else {
      logger.warn(`Tried to check owner for non-existend channel (${channelName}).`);
      return false;
    }
  }

  /**
   * Removes a channel from the PrivateChannelRegistry
   * @param channelName The name of the channel to remove.
   * @returns Boolean if the deletion was successful.
   */
  deleteChannelEntry(channelName: string): boolean {
    logger.debug(`Deleting channel(${channelName}) from PrivateChannelRegistry`);
    const del = this.__store.delete(channelName);
    if (del) {
      activeChannels.set(this.__store.size);
      return true;
    } else return false;
  }
}

import { genID, logger } from '@/utils';

export class PrivateChannelRegistry {
  private __store: Map<String, String>;
  private __id: string;

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
    return !this.__store.has(channelName);
  }

  /**
   * Add a channel to the PrivateChannelRegistry.
   * @param channelName Name of the channel to add.
   * @param owner The owner assosiated with the channel.
   */
  addChannelToRegistry(channelName: string, owner: string): void {
    this.__store.set(channelName, owner);
  }

  /**
   * Check if the owner for a channel matches.
   * @param channelName The name of the channel to check.
   * @param ownerToCheck The potential owner of the channel.
   * @returns True if the owner matches and false if it doesn't or the channel isn't found. If channel isn't found a warning is raised.
   */
  checkOwnerMatch(channelName: string, ownerToCheck: string): boolean {
    if (this.__store.has(channelName)) {
      const ownerOfChannel = this.__store.get(channelName);
      if (ownerOfChannel === ownerToCheck) return true;
      else return false;
    } else {
      logger.warn(`Tried to check owner for non-existend channel.`);
      return false;
    }
  }

  /**
   * Removes a channel from the PrivateChannelRegistry
   * @param channelName The name of the channel to remove.
   * @returns Boolean if the deletion was successful.
   */
  deleteChannelEntry(channelName: string): boolean {
    return this.__store.delete(channelName);
  }
}

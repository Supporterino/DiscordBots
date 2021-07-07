import { ApplicationCommandData } from 'discord.js';
import { genID, logger } from '@/utils';

export class CommandRegistry {
  private __store: Map<string, ApplicationCommandData>;
  private __id: string;

  constructor() {
    this.__id = genID();
    this.__store = new Map<string, ApplicationCommandData>();
    logger.info(`Created new PrivateChannelRegistry with id (${this.__id}).`);
    this.init();
  }

  /**
   * Initializes the CommandRegistry with the predefined commands
   */
  private init() {
    this.addCommand('privateChannelCreate', {
      name: 'create_channel',
      description: 'Create a private Channel',
      options: [
        {
          type: 3,
          name: 'channelname',
          description: 'Name for the channel',
          required: false
        },
        {
          type: 6,
          name: 'user1',
          description: 'User to move with you',
          required: false
        },
        {
          type: 6,
          name: 'user2',
          description: 'User to move with you',
          required: false
        },
        {
          type: 6,
          name: 'user3',
          description: 'User to move with you',
          required: false
        }
      ]
    });
  }

  /**
   * Adds a command defintion to the registry
   * @param name The name to identify the command
   * @param command The command definiton object
   */
  addCommand(name: string, command: ApplicationCommandData): void {
    this.__store.set(name, command);
  }

  /**
   * Check if the Registry has the requested command
   * @param name The name of the command to check
   * @returns Boolean indicating if the command is present
   */
  hasCommand(name: string): boolean {
    return this.__store.has(name);
  }

  /**
   * Retrieve a command from the registry by name.
   * @param name The name of the command to retrieve from the registry
   * @returns The ApplicationCommandData of the command
   */
  getCommandData(name: string): ApplicationCommandData {
    return this.__store.get(name);
  }
}

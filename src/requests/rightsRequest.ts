import { CommandInteraction, User } from 'discord.js';
import { getPermissionByString, PermissionHandler, PERMISSIONS } from '../executables/permissionHandler';
import { logger, RightsCommandType } from '../utils';

/**
 * A wrapper to execute the two rights commands
 */
export class RightsRequest {
  private __type: RightsCommandType;
  private __cmd: CommandInteraction;
  private __user!: User;
  private __permission!: PERMISSIONS;
  private __permissionHandler: PermissionHandler;

  /**
   * Constructs a new RightsRequest
   * @param cmd The CommandInteraction triggering the request
   * @param type The RightsCommandType indicating if its a removal or addition
   * @param ph The PermissionHandler of the bot
   */
  constructor(cmd: CommandInteraction, type: RightsCommandType, ph: PermissionHandler) {
    this.__cmd = cmd;
    this.__type = type;
    this.__permissionHandler = ph;
  }

  /**
   * Runs the addition or removal of the rights
   */
  execute() {
    switch (this.__type) {
      case RightsCommandType.ADD:
        logger.info(`Adding the right ${this.__permission} to user ${this.__user.username}`);
        this.__permissionHandler.addRight(this.__user.id, this.__permission);
        this.__cmd.reply({
          ephemeral: true,
          content: `Added the right ${this.__permission} to user ${this.__user.username}`
        });
        break;
      case RightsCommandType.REMOVE:
        logger.info(`Removing the right ${this.__permission} from user ${this.__user.username}`);
        this.__permissionHandler.removeRight(this.__user.id, this.__permission);
        this.__cmd.reply({
          ephemeral: true,
          content: `Removed the right ${this.__permission} from user ${this.__user.username}`
        });
        break;
      default:
        break;
    }
  }

  /**
   * Loads the CommandInteraction options to the class
   */
  extractInformation() {
    this.__user = this.__cmd.options.getUser('user')!;
    this.__permission = getPermissionByString(this.__cmd.options.getString('right')!);
  }
}

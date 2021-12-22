import { CommandInteraction, Guild } from 'discord.js';
import { genHash, logger, renameGuildMembers, renameGuildRoles, Renames } from '../utils';

/**
 * The {@link RenameRequest} extracts the new name from the CommandInteraction and updates the server or uses a random hash as the new name
 */
export class RenameRequest {
  private __guild!: Guild;
  private __command: CommandInteraction;
  private __targetName!: string;

  constructor(cmd: CommandInteraction) {
    this.__command = cmd;
  }

  /**
   * This function extracts the initial information from a CommandInteraction
   */
  extractInformation(): void {
    if (this.__command.guild) this.__guild = this.__command.guild;
    else logger.error(new Error(`No Guild attached to request.`));
    this.getMentionedUsers();
  }

  /**
   *  Start the execution of a {@link RenameRequest}
   */
  execute(): void {
    logger.info(`Executing RenameRequest`);
    this.__command.reply(`Changing names to ${this.__targetName}`);
    if (this.__targetName) {
      logger.debug(`Renaming to ${this.__targetName}`);
      renameGuildMembers(this.__guild, this.__targetName);
      renameGuildRoles(this.__guild, this.__targetName, 'Menschen');
    } else {
      logger.debug(`Renaming to random hash`);
      const hash = genHash();
      renameGuildMembers(this.__guild, hash);
      renameGuildRoles(this.__guild, hash, 'Menschen');
    }
    Renames.inc();
  }

  /**
   * Extracts the possible name for the new user and roles name from the command options
   */
  private getMentionedUsers(): void {
    let name = this.__command.options.get('name');
    if (name !== null) {
      this.__targetName = name.value!.toString();
    }
  }
}

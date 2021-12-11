import { CommandInteraction, Guild } from 'discord.js';
import { genHash, logger, renameGuildMembers, renameGuildRoles } from '../utils';

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
   *  Start the execution of a MoveRequest
   */
  execute(): void {
    this.__command.reply(`Changing names to ${this.__targetName}`);
    if (this.__targetName) {
      renameGuildMembers(this.__guild, this.__targetName);
      renameGuildRoles(this.__guild, this.__targetName);
    } else {
      const hash = genHash();
      renameGuildMembers(this.__guild, hash);
      renameGuildRoles(this.__guild, hash);
    }
  }

  /**
   * Extracts the possible mentioned users from the CommandInteraction and stores them in a local array
   */
  private getMentionedUsers(): void {
    let mentionedName = this.__command.options.get('name');
    if (mentionedName !== null) {
      this.__targetName = mentionedName.value!.toString();
    }
  }
}

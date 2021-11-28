import { CommandInteraction, Guild } from 'discord.js';
import { genID, logger } from '../utils';

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
      this.rename(true);
    } else {
      this.rename(false);
    }
  }

  rename(set_name: boolean): void {
    this.__guild.members
      .fetch()
      .then((data) => {
        data.forEach((member) => {
          logger.debug(`Changing name of ${member.user.username} with id ${member.id}`);
          if (set_name) {
              if (this.__targetName === 'reset') member.setNickname(member.user.username);
              else member.setNickname(this.__targetName);
            }
          else member.setNickname(genID());
        });
      })
      .catch((err) => {
        logger.error(err);
      });
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

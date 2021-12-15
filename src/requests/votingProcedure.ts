import {
  CollectorFilter,
  CommandInteraction,
  Guild,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed
} from 'discord.js';
import {
  DefinitionObject,
  linkify,
  logger,
  renameGuildMembers,
  renameGuildRoles,
  successfulVotingProcedures,
  VotingProcedures
} from '../utils';

/**
 * This class provides the ability to start a vote for a new server name by using three random words from urban dictonary
 */
export class VotingProcedure {
  private __command: CommandInteraction;
  private __guild!: Guild;
  private __opt1C: number = 0;
  private __opt2C: number = 0;
  private __opt3C: number = 0;
  private __pressed: Array<string>;
  private __opt1!: [string, string];
  private __opt2!: [string, string];
  private __opt3!: [string, string];
  private __opt4!: [string, string];
  private __timeout: number;
  private __nextVotetime: string;

  /**
   * Initialize a server rename voting procedure
   * @param cmd The triggering CommandInteraction
   * @param timeout The timeout for the collector to wait for votes
   */
  constructor(cmd: CommandInteraction, timeout: number, nextVote: string) {
    this.__command = cmd;
    this.__timeout = timeout;
    this.__pressed = new Array<string>();
    this.__nextVotetime = nextVote;
  }

  /**
   * This function loads three possible new names for a voting procedure
   */
  genOptions(): void {
    logger.debug(`Loading random words to use from urban dictornary`);
    const ud = require('urban-dictionary');
    ud.random()
      .then((data: DefinitionObject[]) => {
        let counter = 1;
        data.forEach((entry) => {
          if (entry.word.length < 32) {
            eval(`this.__opt${counter} = [entry.word, entry.definition]`);
            counter++;
          }
        });
        this.run();
      })
      .catch((err: Error) => {
        logger.warn(`UrbanDictonary request failed: ${err}`);
      });
  }

  /**
   * This function extracts the initial information from a CommandInteraction
   */
  extractInformation(): void {
    if (this.__command.guild) this.__guild = this.__command.guild;
    else logger.error(new Error(`No Guild attached to request.`));
  }

  /**
   *  Start the execution of a VotingProcedure
   */
  execute(): void {
    logger.info(`Executing VotingProcedure`);
    VotingProcedures.inc();
    this.genOptions();
  }

  /**
   * This method starts the actual execution of the voting procedure by posting the message and contructing the collector .
   */
  run(): void {
    logger.debug('Sending vote message');
    this.__command.reply({ content: 'Please vote for the next server name', components: [this.createVotingMessage()] });
    this.constructorCollector();
  }

  /**
   * This function constructs a collector which listens for button presses. If a users presses the button for the first time the vote gets registered otherwise a error is sent to the user. After the vote time the actual rename is triggered by the collector end event.
   */
  constructorCollector(): void {
    const opt1F: CollectorFilter<MessageComponentInteraction[]> = (i) =>
      i.customId === 'option1' || i.customId === 'option2' || i.customId === 'option3';
    const collector = this.__command.channel?.createMessageComponentCollector({ filter: opt1F, time: this.__timeout });

    logger.debug(`Initialized collector with timeout of ${this.__timeout / 1000} seconds`);

    collector?.on('collect', (mci) => {
      if (mci.customId === 'option1' && !this.__pressed.includes(mci.user.id)) {
        logger.debug(`${this.__opt1[0]} pressed by ${mci.user.id}`);
        this.__opt1C++;
        this.__pressed.push(mci.user.id);
        mci.reply({ ephemeral: true, content: `You voted for ${this.__opt1[0]}` });
      } else if (mci.customId === 'option2' && !this.__pressed.includes(mci.user.id)) {
        logger.debug(`${this.__opt2[0]} pressed by ${mci.user.id}`);
        this.__opt2C++;
        this.__pressed.push(mci.user.id);
        mci.reply({ ephemeral: true, content: `You voted for ${this.__opt2[0]}` });
      } else if (mci.customId === 'option3' && !this.__pressed.includes(mci.user.id)) {
        logger.debug(`${this.__opt3[0]} pressed by ${mci.user.id}`);
        this.__opt3C++;
        this.__pressed.push(mci.user.id);
        mci.reply({ ephemeral: true, content: `You voted for ${this.__opt3[0]}` });
      } else {
        mci.reply({ ephemeral: true, content: `You already voted` });
      }
    });

    collector?.on('end', () => {
      logger.info(`Voting phase over.`);
      this.triggerRename();
    });
  }

  /**
   * This function dtermines which of the three options have won and then triggers the rename and constructs the information to update the message if. If no option won the message is adjusted acordingly.
   */
  triggerRename(): void {
    if (this.__opt1C > this.__opt2C && this.__opt1C > this.__opt3C) {
      logger.info(`${this.__opt1[0]} won the vote. Starting rename.`);
      renameGuildMembers(this.__guild, this.__opt1[0]);
      renameGuildRoles(this.__guild, this.__opt1[0], 'Menschen');
      this.__command.editReply({
        content: ' ',
        embeds: [
          new MessageEmbed()
            .setColor('#008080')
            .setTitle(this.__opt1[0])
            .setAuthor('The Rename Bot')
            .setDescription(linkify(this.__opt1[1]))
            .addFields(
              { name: `Votes for ${this.__opt1[0]}`, value: `${this.__opt1C}`, inline: true },
              { name: `Votes for ${this.__opt2[0]}`, value: `${this.__opt2C}`, inline: true },
              { name: `Votes for ${this.__opt3[0]}`, value: `${this.__opt3C}`, inline: true },
              { name: 'Next Vote', value: this.__nextVotetime }
            )
            .setTimestamp()
        ],
        components: []
      });
      successfulVotingProcedures.inc();
    } else if (this.__opt2C > this.__opt1C && this.__opt2C > this.__opt3C) {
      logger.info(`${this.__opt2[0]} won the vote. Starting rename.`);
      renameGuildMembers(this.__guild, this.__opt2[0]);
      renameGuildRoles(this.__guild, this.__opt2[0], 'Menschen');
      this.__command.editReply({
        content: ' ',
        embeds: [
          new MessageEmbed()
            .setColor('#008080')
            .setTitle(this.__opt2[0])
            .setAuthor('The Rename Bot')
            .setDescription(linkify(this.__opt2[1]))
            .addFields(
              { name: `Votes for ${this.__opt1[0]}`, value: `${this.__opt1C}`, inline: true },
              { name: `Votes for ${this.__opt2[0]}`, value: `${this.__opt2C}`, inline: true },
              { name: `Votes for ${this.__opt3[0]}`, value: `${this.__opt3C}`, inline: true },
              { name: 'Next Vote', value: this.__nextVotetime }
            )
            .setTimestamp()
        ],
        components: []
      });
      successfulVotingProcedures.inc();
    } else if (this.__opt3C > this.__opt2C && this.__opt3C > this.__opt1C) {
      logger.info(`${this.__opt3[0]} won the vote. Starting rename.`);
      renameGuildMembers(this.__guild, this.__opt3[0]);
      renameGuildRoles(this.__guild, this.__opt3[0], 'Menschen');
      this.__command.editReply({
        content: ' ',
        embeds: [
          new MessageEmbed()
            .setColor('#008080')
            .setTitle(this.__opt3[0])
            .setAuthor('The Rename Bot')
            .setDescription(linkify(this.__opt3[1]))
            .addFields(
              { name: `Votes for ${this.__opt1[0]}`, value: `${this.__opt1C}`, inline: true },
              { name: `Votes for ${this.__opt2[0]}`, value: `${this.__opt2C}`, inline: true },
              { name: `Votes for ${this.__opt3[0]}`, value: `${this.__opt3C}`, inline: true },
              { name: 'Next Vote', value: this.__nextVotetime }
            )
            .setTimestamp()
        ],
        components: []
      });
      successfulVotingProcedures.inc();
    } else {
      logger.info(`${this.__opt4[0]} randomly selected no winner. Starting rename.`);
      renameGuildMembers(this.__guild, this.__opt4[0]);
      renameGuildRoles(this.__guild, this.__opt4[0], 'Menschen');
      this.__command.editReply({
        content: 'Random name was choosen since there was no winnner.',
        embeds: [
          new MessageEmbed()
            .setColor('#008080')
            .setTitle(this.__opt4[0])
            .setAuthor('The Rename Bot')
            .setDescription(linkify(this.__opt4[1]))
            .addFields(
              { name: `Votes for ${this.__opt1[0]}`, value: `${this.__opt1C}`, inline: true },
              { name: `Votes for ${this.__opt2[0]}`, value: `${this.__opt2C}`, inline: true },
              { name: `Votes for ${this.__opt3[0]}`, value: `${this.__opt3C}`, inline: true },
              { name: 'Next Vote', value: this.__nextVotetime }
            )
            .setTimestamp()
        ],
        components: []
      });
      successfulVotingProcedures.inc();
    }
  }

  /**
   * Creates the MessageButtons to add to the voting message
   * @returns A MessageActionRow with the three voting buttons
   */
  createVotingMessage(): MessageActionRow {
    return new MessageActionRow()
      .addComponents(new MessageButton().setCustomId('option1').setLabel(this.__opt1[0]).setStyle('PRIMARY'))
      .addComponents(new MessageButton().setCustomId('option2').setLabel(this.__opt2[0]).setStyle('PRIMARY'))
      .addComponents(new MessageButton().setCustomId('option3').setLabel(this.__opt3[0]).setStyle('PRIMARY'));
  }
}

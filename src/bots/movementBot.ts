import { BasicBot } from './basicBot';
import { Client, Intents, CommandInteraction, VoiceChannel } from 'discord.js';

export class MovementBot extends BasicBot {
  constructor() {
    super();
  }

  /**
   * Wrapper function to initialize the Bot and connect it with its auth token.
   * @param auth token of the Bot.
   */
  run(auth: string) {
    this.init();
    this.client.login(auth);
  }

  /**
   * This function creates the client with the needed event listeners and check if a command is present.
   */
  init() {
    this.client = new Client({
      presence: {
          status: 'online'
      },
      intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_BANS,
          Intents.FLAGS.GUILD_EMOJIS,
          Intents.FLAGS.GUILD_INTEGRATIONS,
          Intents.FLAGS.GUILD_INVITES,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
          Intents.FLAGS.GUILD_MESSAGE_TYPING,
          Intents.FLAGS.GUILD_VOICE_STATES,
          Intents.FLAGS.GUILD_WEBHOOKS
      ]
    });

    const moveHereCommand = {
        name: "move_here",
        description: "Moves a mention user into your voice channel",
        options: [
          {
            type: 6,
            name: "user",
            description: "The user to move to your channel",
            required: true
          }
        ]
    };

    const moveToCommand = {
        name: "move_to",
        description: "Moves a mention user into your voice channel",
        options: [
          {
            type: 6,
            name: "user",
            description: "The user to move to a channel",
            required: true
          },
          {
            type: 7,
            name: "channel",
            description: "The voicechannel to move the user to",
            required: true
          }
        ]
    }

    this.client.on('ready', () => {
      this.logger.info(`Logged in as ${this.client.user.tag}`);
    });

    this.client.once('ready', () => {
      this.client.application.commands.create(moveHereCommand);
      this.client.application.commands.create(moveToCommand);
    });

    this.client.ws.on('INTERACTION_CREATE', (interaction: any) => {
      if (interaction.type == '2') {
          const command = new CommandInteraction(this.client, interaction);

          if (command.commandName === 'move_here') {
            this.moveHere(command)
          } else {
            this.moveTo(command)
          }
      } else {
          this.logger.warn(`Received interaction isn't a command. Type is ${interaction.type}`);
      }
    });
  }

  /**
   * The function moveHere takes the provided user which is given by the command and moves him in the voice channel of the author. If no target is specified an error is emitted.
   * @param msg Recieved message with the command
   */
  moveHere(msg: CommandInteraction) {
    const vChannel = this.getVChannelOfAuthor(msg);
    this.logger.debug(`Active voice channel: ${vChannel.name.toString()}`);
    const target = msg.options.find((option) => option.name === 'user');
    this.setVoiceChannel(this.getGuildMemberById(msg.guild, target.user), <VoiceChannel> vChannel);
  }

  /**
   * The function moveTo executes the command with the structure: !moveTo TargetUser TargetChannel. It moves the TargetUser to the spezified channel.
   * @param msg  Recieved message with command.
   */
  moveTo(msg: CommandInteraction) {
    const targetChannel = msg.options.find((option) => option.name === 'channel');
    const targetUser = msg.options.find((option) => option.name === 'user');

    if (targetChannel.channel.type === 'voice') this.setVoiceChannel(this.getGuildMemberById(msg.guild, targetUser.user), <VoiceChannel> targetChannel.channel);
    else msg.reply(`The targeted channel isn't a voice channel.`);
  }
}

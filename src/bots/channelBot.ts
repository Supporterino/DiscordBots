import { BasicBot } from './basicBot';
import { Message, VoiceState, VoiceChannel, Client, Intents, Interaction, CommandInteraction } from 'discord.js';

export class ChannelBot extends BasicBot {
    private activeChannels: Map<String, String>;
    constructor() {
        super();
        this.activeChannels = new Map<String, String>();
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

        const createCommand = {
            name: 'channelcreate',
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
                    name: 'users',
                    description: 'People to move with you',
                    required: false
                }
            ]
        };

        this.client.on('ready', () => {
            this.logger.info(`Logged in as ${this.client.user.tag}`);
        });

        this.client.once('ready', () => {
            this.client.application.commands.create(createCommand);
        });

        this.client.ws.on('INTERACTION_CREATE', (interaction: any) => {
            if (interaction.type == '2') {
                const command = new CommandInteraction(this.client, interaction);
                this.createPrivateChannel(command);
            } else {
                this.logger.warn(`Received interaction isn't a command. Type is ${interaction.type}`);
            }
        });

        this.client.on('voiceStateUpdate', (event: VoiceState) => {
            this.checkDeleteRequired(event);
        });
    }

    /**
     * The function replys to the command with the list of the supported commands.
     * @param msg Recieved message with command
     */
    printHelp(msg: Message) {
        msg.reply(
            `The following commands are availible for the PrivateChannelBot:
            \t!channelCreate ?Name ?[Mentions] - Creates a private channel with the optional given name und moves the possible followers with you.
            `
        );
    }

    /**
     * The function extracts the optinal name of a private channel and create the corresponding channel, if it doesn't already exist. The author is moved inside the channel and all mentioned users as well.
     * @param msg Recieved message with command.
     */
    createPrivateChannel(msg: CommandInteraction) {
        const channelName = this.extractOrCreateChannelname(msg);
        if (this.activeChannels.has(channelName)) {
            msg.reply(`A channel with this name (${channelName}) already exists.`);
        } else {
            this.activeChannels.set(channelName, this.getNameOfAuthor(msg));
            msg.guild.channels
                .create(channelName, {
                    type: 'voice',
                    parent: this.getChannelByName(msg.guild, 'Private Channels'),
                    permissionOverwrites: [
                        {
                            id: msg.guild.id,
                            deny: ['VIEW_CHANNEL']
                        }
                    ]
                })
                .then((vc) => {
                    msg.reply(`Your channel ${channelName} was created and you are moved to it. Leaving it will delete the channel.`);
                    this.getGuildMember(msg).voice.setChannel(vc);
                    if (msg.options && msg.options.has('users')) {
                        const target = msg.options.find((option) => option.name === 'users');
                        this.getGuildMemberById(msg.guild, target.user).voice.setChannel(vc);
                    }
                });
            this.logger.info(`Created private channel for user (${this.getNameOfAuthor(msg)}) with name: ${channelName}`);
        }
    }

    /**
     * Moves all mentioned users with the creator of a private channel
     * @param msg Recieved message with command
     * @param vc The VoiceChannel object of the created channel
     */
    moveWithCreator(msg: Message, vc: VoiceChannel) {
        msg.mentions.users.forEach((user) => {
            //msg.guild.member(user).voice.setChannel(vc);
        });
    }

    /**
     * Checks if a creator of a private channel leaves it. If this is true all other members are moved to AFK and channel is deleted.
     * @param event The emitted VoiceState event
     */
    checkDeleteRequired(event: VoiceState) {
        const activeUser = event.member.displayName.toString();
        let activeChannel = '';
        if (event.channel != undefined) activeChannel = event.channel.name.toString();
        if (this.activeChannels.has(activeChannel)) {
            if (this.activeChannels.get(activeChannel) === activeUser) {
                if (event.channel.members.size > 0)
                    event.channel.members.forEach((user) => user.voice.setChannel(this.getVChannelByName(event.guild, 'AFK')));
                event.channel.delete(`Owner left.`);
                this.activeChannels.delete(activeChannel);
                this.logger.info(`Removed private channel of ${activeUser}.`);
            }
        }
    }

    /**
     * The function checks if there are mentions in the command and extracts the name of the private channel, if no name is provided the name is set to: Username's Channel.
     * @param msg Message object to process
     * @return string with the channel name
     */
    extractOrCreateChannelname(msg: CommandInteraction): string {
        let channelName = '';
        if (msg.options && msg.options.has('channelname')) {
            channelName = msg.options.find((option) => option.name === 'channelname').value.toString();
        } else {
            channelName = `${this.getNameOfAuthor(msg)}'s Channel`;
        }
        this.logger.debug(`Channelname set to: ${channelName}`);
        return channelName;
    }
}

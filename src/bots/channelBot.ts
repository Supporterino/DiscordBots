import { BasicBot } from "./basicBot";
import { Message, VoiceState, VoiceChannel } from "discord.js";
import { ArgumentCollectorResult, Command, CommandInfo, CommandoClient } from "discord.js-commando";
import { cli } from "winston/lib/winston/config";

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
        this.client = new CommandoClient({
            presence: {
                status: 'online',
                activity: {
                    name: '!channelHelp',
                    type: 'LISTENING'
                }
            }
        });

        this.client.on('ready', () => {
            this.logger.info(`Logged in as ${this.client.user.tag}`);
        });

        const createCommand: CreateChannelCommand = new CreateChannelCommand(this.client)
        const helpCommand: ChannelHelpCommand = new ChannelHelpCommand(this.client);

        this.client.registry
            .registerGroups([['channelbot', 'Commands to manage private channel bot']])
            .registerDefaults()
            .registerCommand(helpCommand)
            .registerCommand(createCommand)
        // this.client.on('message', msg => {
        //     if (msg.content.substring(0, 8) === '!channel') {
        //         let args = msg.content.substring(1).split(' ');
        //         let cmd = args[0];

        //         switch (cmd) {
        //             case 'channelHelp':
        //                 this.printHelp(msg);
        //                 break;
        //             case 'channelCreate':
        //                 this.createPrivateChannel(msg);
        //                 break;
        //             default:
        //                 msg.reply(`Command (${cmd}) not found!`);
        //                 this.printHelp(msg);
        //                 break;
        //         }
        //     }
        // });

        this.client.on('voiceStateUpdate', event => {
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
    createPrivateChannel(msg: Message) {
        const channelName = this.extractOrCreateChannelname(msg);
        if (this.activeChannels.has(channelName)) msg.reply(`A channel with this name (${channelName}) already exists.`);
        else {
            this.activeChannels.set(channelName, this.getNameOfAuthor(msg));
            msg.guild.channels.create(channelName, {
                type: 'voice',
                parent: this.getChannelByName(msg.guild, 'Private Channels'),
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        deny: ['VIEW_CHANNEL']
                    }
                ]
            })
                .then(vc => {
                    msg.reply(`Your channel ${channelName} was created and you are moved to it. Leaving it will delete the channel.`);
                    msg.member.voice.setChannel(vc);
                    if (msg.mentions.users.size > 0) this.moveWithCreator(msg, vc);
                });
            this.logger.info(`Created private channel for user (${msg.member.displayName.toString()}) with name: ${channelName}`);
        }
    }

    /**
     * Moves all mentioned users with the creator of a private channel
     * @param msg Recieved message with command
     * @param vc The VoiceChannel object of the created channel
     */
    moveWithCreator(msg: Message, vc: VoiceChannel) {
        msg.mentions.users.forEach(user => {
            msg.guild.member(user).voice.setChannel(vc);
        })
    }

    /**
     * Checks if a creator of a private channel leaves it. If this is true all other members are moved to AFK and channel is deleted.
     * @param event The emitted VoiceState event
     */
    checkDeleteRequired(event: VoiceState) {
        const activeUser = event.member.displayName.toString();
        let activeChannel = '';
        if(event.channel != undefined) activeChannel = event.channel.name.toString();
        if (this.activeChannels.has(activeChannel)) {
            if (this.activeChannels.get(activeChannel) === activeUser) {
                if (event.channel.members.size > 0) event.channel.members.forEach(user => user.voice.setChannel(this.getVChannelByName(event.guild, 'AFK')));
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
    extractOrCreateChannelname(msg: Message) {
        const mentions = msg.mentions.users;
        let channelName = '';
        if (mentions.size <= 0) channelName = msg.content.substring(15).trim();
        else channelName = msg.content.substring(15).split('<@')[0].trim();
        if (channelName === '') channelName = `${this.getNameOfAuthor(msg)}'s Channel`;
        return channelName;
    }
}

class ChannelHelpCommand extends Command {
    constructor(client: CommandoClient) {
        const info: CommandInfo = {
            name: 'channel-help',
            aliases: ['ch', 'channelHelp'],
            group: 'channelbot',
            memberName: 'help',
            description: 'Create a private channel for a user and move all mentions to it',
        }
        super(client, info)
    }
    run(msg: Message): Promise<Message> {
        return msg.reply(
            `The following commands are availible for the PrivateChannelBot:
            \t!channelCreate ?Name ?[Mentions] - Creates a private channel with the optional given name und moves the possible followers with you.
            `
        );
    }
}

class CreateChannelCommand extends Command {
    constructor(client: CommandoClient) {
        const info: CommandInfo = {
            name: 'create-channel',
            aliases: ['cc', 'createChannel'],
            group: 'channelbot',
            memberName: 'create',
            description: 'Create a private channel for a user and move all mentions to it',
            args: [
                {
                    key: 'name',
                    label: 'ChannelName',
                    prompt: 'What is the name of the channel?',
                    type: 'string',
                    default: ''
                },
                {
                    key: 'mention',
                    label: 'Mentions',
                    prompt: 'Users to move in your channel',
                    type: 'user',
                    default: '',
                    infinite: true
                }
            ]
        }
        super(client, info)
    }
    run(message: Message, args: ArgumentCollectorResult): null {
        //return message.reply(``);
        return
    }
}
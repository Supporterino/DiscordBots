import { BasicBot } from "./basicBot";
import { Client, Message, VoiceState, VoiceChannel, PermissionOverwrites } from "discord.js";

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
    run(auth) {
        this.init();
        this.client.login(auth);
    }

    /**
     * This function creates the client with the needed event listeners and check if a command is present.
     */
    init() {
        this.client = new Client();

        this.client.on('ready', () => {
            this.logger.info(`Logged in as ${this.client.user.tag}`);
        });

        this.client.on('message', msg => {
            if (msg.content.substring(0, 8) === '!channel') {
                let args = msg.content.substring(1).split(' ');
                let cmd = args[0];

                switch (cmd) {
                    case 'channelHelp':
                        this.printHelp(msg);
                        break;
                    case 'channelCreate':
                        this.createPrivateChannel(msg);
                        break;
                    default:
                        msg.reply(`Command (${cmd}) not found!`);
                        this.printHelp(msg);
                        break;
                }
            }
        });

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
            \t!channelCreate
            `
        )
    }

    createPrivateChannel(msg: Message) {
        const mentions = msg.mentions.users;
        let channelName = '';
        if (mentions.size <= 0) channelName = msg.content.substring(15).trim();
        else channelName = msg.content.substring(15).split('<@')[0].trim();
        if (this.activeChannels.has(channelName)) msg.reply(`A channel with this name (${channelName}) already exists.`);
        else {
            if (channelName === '') channelName = `${msg.member.displayName.toString()}'s Channel`;
            this.activeChannels.set(channelName, msg.member.displayName.toString());
            msg.guild.channels.create(channelName, {
                type: 'voice',
                parent: msg.guild.channels.cache.find(channel => channel.name === "Private Channels"),
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        deny: ['VIEW_CHANNEL']
                    }
                ]
            })
                .then(vc => {
                    msg.reply(`Your channel ${channelName} was created and you are moved to it. Leaving it will delete the channel.`)
                    msg.member.voice.setChannel(vc);
                    if (mentions.size > 0) this.moveWithCreator(msg, vc);
                });
        }
    }

    moveWithCreator(msg: Message, vc: VoiceChannel) {
        msg.mentions.users.forEach(user => {
            msg.guild.member(user).voice.setChannel(vc);
        })
    }

    checkDeleteRequired(event: VoiceState) {
        const activeUser = event.member.displayName.toString();
        let activeChannel = '';
        if(event.channel != undefined) activeChannel = event.channel.name.toString();
        if (this.activeChannels.has(activeChannel)) {
            if (this.activeChannels.get(activeChannel) === activeUser) {
                event.channel.delete(`Owner left.`);
                this.activeChannels.delete(activeChannel);
            }
        }
    }
}
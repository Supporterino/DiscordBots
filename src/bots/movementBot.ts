import { BasicBot } from "./basicBot";
import { Message, VoiceChannel } from "discord.js";
import { CommandoClient } from "discord.js-commando";

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
        this.client = new CommandoClient({
            presence: {
                status: 'online',
                activity: {
                    name: '!moveHelp',
                    type: 'LISTENING'
                }
            }
        });

        this.client.on('ready', () => {
            this.logger.info(`Logged in as ${this.client.user.tag}`);
        });
        
        this.client.on('message', msg => {
            if (msg.content.substring(0, 5) === '!move') {
                let args = msg.content.substring(1).split(' ');
                let cmd = args[0];
        
                if(!this.checkAuth(msg)) msg.reply("Not Authorized!");
                else {
                    switch (cmd) {
                        case 'moveHere':
                            this.moveHere(msg);
                            break;
                        case 'moveTo':
                            this.moveTo(msg);
                            break;
                        case 'moveHelp':
                            this.printHelp(msg);
                            break;
                        default:
                            msg.reply(`Command (${cmd}) not found!`);
                            this.printHelp(msg);
                            break;
                    }
                }
            }
        });
    }

    /**
     * The function replys to the command with the list of the supported commands.
     * @param msg Recieved message with command
     */
    printHelp(msg: Message) {
        msg.reply(
            `The following commands are availible for the MovementBot:
            \t!moveHere @Target - Moves a user to your voice channel.
            \t!moveTo @Target voice_channel - Moves a user to a defined voice channel.
            `
        )
    }

    /**
     * The function moveHere takes the provided user which is given by the command and moves him in the voice channel of the author. If no target is specified an error is emitted.
     * @param msg Recieved message with the command
     */
    moveHere(msg: Message) {
        if (!this.getSingleMention(msg)) msg.reply("You need to mention a target!");
        else {
            const vChannel = this.getVChannelOfAuthor(msg);
            this.logger.debug(`Active voice channel: ${vChannel.name.toString()}`);
    
            this.setVoiceChannel(this.getSingleMention(msg), vChannel);
        }
    }
    
    /**
     * The function moveTo executes the command with the structure: !moveTo TargetUser TargetChannel. It moves the TargetUser to the spezified channel.
     * @param msg  Recieved message with command.
    */
    moveTo(msg: Message) {
        if (!this.getSingleMention(msg)) msg.reply("You need to mention a target!");
        else {
            const channelTarget = msg.content.split(this.getSingleMention(msg).user.toString().substring(3))[msg.content.split(this.getSingleMention(msg).user.toString().substring(3)).length - 1].trim();
            this.logger.debug(`Target voice channel: ${channelTarget.toString()}`);
            const vChannel = this.getVChannelByName(msg.guild, channelTarget);
            if (vChannel != undefined) {
                this.setVoiceChannel(this.getSingleMention(msg), vChannel);
            } else {
                msg.reply(`Target channel (${channelTarget}) not found.`);
                this.logger.warn(`Voice channel (${channelTarget}) not found.`);
            }
        }
    }
}
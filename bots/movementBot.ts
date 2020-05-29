import { BasicBot } from "./BasicBot";
import { Message, VoiceChannel, Client } from "discord.js";
import { createLogger } from "winston";

export class MovementBot extends BasicBot {
    constructor() {
        super();
    }

    run(auth) {
        this.init();
        this.client.login(auth);
    }

    init() {
        this.client = new Client();

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
                        default:
                            msg.reply(`Command (${cmd}) not found!`);
                            break;
                    }
                }
            }
        });
    }

    moveHere(msg: Message) {
        if (!msg.mentions.users.first()) msg.channel.send("You need to mention a target!");
        else {
            const vChannel = msg.member.voice.channel;
            this.logger.debug(`Active voice channel: ${vChannel.name.toString()}`);
    
            const target = this.getTarget(msg);
            target.voice.setChannel(vChannel);
            this.logger.info(`Moved ${target.displayName.toString()} to ${vChannel.name.toString()}`);
        }
    }
    
    moveTo(msg: Message) {
        if (!msg.mentions.users.first()) msg.channel.send("You need to mention a target!");
        else {
            const userTarget = this.getTarget(msg);
            const channelTarget = msg.content.split(userTarget.user.toString().substring(3))[msg.content.split(userTarget.user.toString().substring(3)).length - 1].trim();
            this.logger.debug(`User to move to channel: ${userTarget.displayName.toString()}`);
            this.logger.debug(`Target voice channel: ${channelTarget.toString()}`);
            const vChannel: VoiceChannel = this.getVChannelByName(msg.guild, channelTarget);
            if (vChannel != undefined) {
                userTarget.voice.setChannel(vChannel);
                this.logger.info(`Moved ${userTarget.displayName.toString()} to ${vChannel.name.toString()}`);
            } else {
                msg.reply(`Target channel (${channelTarget}) not found.`);
                this.logger.warn(`Voice channel (${channelTarget}) not found.`);
            }
        }
    }
}
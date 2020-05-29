import { BasicBot } from "./basicBot";
import { Client, Message } from "discord.js";

export class ChannelBot extends BasicBot {
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
            if (msg.content.substring(0, 8) === '!channel') {
                let args = msg.content.substring(1).split(' ');
                let cmd = args[0];
        
                if(!this.checkAuth(msg)) msg.reply("Not Authorized!");
                else {
                    switch (cmd) {
                        case 'channelHelp':
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

    printHelp(msg: Message) {
        msg.reply(
            `The following commands are availible for the PrivateChannelBot:
            `
        )
    }
}
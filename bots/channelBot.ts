import { BasicBot } from "./basicBot";
import { Client, Message } from "discord.js";

export class ChannelBot extends BasicBot {
    constructor() {
        super();
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

    /**
     * The function replys to the command with the list of the supported commands.
     * @param msg Recieved message with command
     */
    printHelp(msg: Message) {
        msg.reply(
            `The following commands are availible for the PrivateChannelBot:
            `
        )
    }
}
import { Logger, createLogger, format, transports } from "winston";
import { Client, Message, Guild, VoiceChannel } from "discord.js";
import { compTwoStringsInsensitive } from "../utils/basicUtils";

export class BasicBot {
    protected logger: Logger = null;
    protected client: Client = null;

    constructor() {
        this.createLog();
    }

    /**
     * Creates the logger for the Bots.
     */
    createLog() {
        this.logger = createLogger({
            level: 'info',
            format: format.combine(
                //format.colorize(),
                format.timestamp(),
                format.align(),
                format.printf(log => {
                  return `${log.timestamp} | ${log.level}: ${log.message}`;
                })
            ),
            defaultMeta: { service: 'user-service' },
            transports: [
                new transports.Console(),
                new transports.File({ filename: 'combined.log' })
            ]
        });
    }

    /**
     * Return the first mentioned user in a command.
     * @param msg Recieved message with command
     * @return The GuildMember object of the referenced user
     */
    getTarget(msg: Message) {
        const temp = msg.guild.member(msg.mentions.users.first());
        this.logger.debug(`Fetched target with name: ${temp.displayName.toString()}`);
        return temp;
    }
    
    /**
     * Returns the VoiceChannel object of a givven channel name.
     * @param guild The active guild of a message
     * @param name The name of the channel to search
     * @return VoiceChannel object
     */
    getVChannelByName(guild: Guild, name: String) {
        let temp: VoiceChannel = undefined;
        temp = <VoiceChannel> guild.channels.cache.find(channel => channel.type === 'voice' && compTwoStringsInsensitive(channel.name, name));
        return temp;
    }
    
    /**
     * Checks if the author of the command is authorized to execute it.
     * @param msg recieved message with command
     * @return Boolean if the author is authorized
     */
    checkAuth(msg: Message) {
        const author = msg.guild.member(msg.author);
        let authorized = false;
        if (author.roles.cache.some(role => compTwoStringsInsensitive(role.name, 'BotRights') || compTwoStringsInsensitive(role.name, 'ADMIN'))) authorized = true;
        this.logger.info(`Checked rights for user: ${author.displayName.toString()}. Result: ${authorized}`);
        return authorized;
    }
}
import { Logger, createLogger, format, transports } from "winston";
import { Client, Message, Guild, VoiceChannel } from "discord.js";
import { compTwoStringsInsensitive } from "../utils/basicUtils";

export class BasicBot {
    protected logger: Logger = null;
    protected client: Client = null;

    constructor() {
        this.createLog();
    }

    getClient() {
        return this.client;
    }

    createLog() {
        this.logger = createLogger({
            level: 'debug',
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

    getTarget(msg: Message) {
        const temp = msg.guild.member(msg.mentions.users.first());
        this.logger.debug(`Fetched target with name: ${temp.displayName.toString()}`);
        return temp;
    }
    
    getVChannelByName(guild: Guild, name: String) {
        let temp: VoiceChannel = undefined;
        temp = <VoiceChannel> guild.channels.cache.find(channel => channel.type === 'voice' && compTwoStringsInsensitive(channel.name, name));
        return temp;
    }
    
    checkAuth(msg: Message) {
        const author = msg.guild.member(msg.author);
        let authorized = false;
        if (author.roles.cache.some(role => compTwoStringsInsensitive(role.name, 'BotRights') || compTwoStringsInsensitive(role.name, 'ADMIN'))) authorized = true;
        this.logger.info(`Checked rights for user: ${author.displayName.toString()}. Result: ${authorized}`);
        return authorized;
    }
}
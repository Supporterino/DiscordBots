import { Logger, createLogger, format, transports } from "winston";
import { Client, Message, Guild, VoiceChannel, GuildMember } from "discord.js";
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
            level: 'silly',
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
    getSingleMention(msg: Message) {
        const temp = msg.guild.member(msg.mentions.users.first());
        this.logger.debug(`Fetched target with name: ${temp.displayName.toString()}`);
        return temp;
    }

    /**
     * Extract the name of the author of a message
     * @param msg Message object to process
     * @return string with the name of the author
     */
    getNameOfAuthor(msg: Message) {
        return msg.member.displayName.toString();
    }

    setVoiceChannel(target: GuildMember, vc: VoiceChannel) {
        target.voice.setChannel(vc);
        this.logger.info(`Moved ${target.displayName.toString()} to ${vc.name.toString()}`);
    }

    /**
     * Finds a channel by name in the provided guild.
     * @param guild The active guild to the message
     * @param name The name of the channel to search
     * @return GuildChannel object
     */
    getChannelByName(guild: Guild, name: string) {
        return guild.channels.cache.find(channel => compTwoStringsInsensitive(channel.name, name));
    }
    
    /**
     * Returns the VoiceChannel object of a givven channel name.
     * @param guild The active guild of a message
     * @param name The name of the channel to search
     * @return VoiceChannel object
     */
    getVChannelByName(guild: Guild, name: string) {
        return <VoiceChannel> this.getChannelByName(guild, name);
    }

    /**
     * This function extracts the active voice channel of the author of the command
     * @param msg recieved message with command
     * @return the VoiceChannel object
     */
    getVChannelOfAuthor(msg: Message) {
        let temp: VoiceChannel = undefined;
        temp = msg.member.voice.channel;
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
import { Message, Guild, Client, VoiceChannel } from "discord.js";
import { format, transports, createLogger } from "winston";

var auth = require('./token.json');

const logger = createLogger({
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

const client = new Client();

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
});

client.on('message', msg => {
    if (msg.content.substring(0, 1) === '!') {
        let args = msg.content.substring(1).split(' ');
        let cmd = args[0];

        if(!checkAuth(msg)) msg.reply("Not Authorized!");
        else {
            switch (cmd) {
                case 'ping':
                    msg.reply('pong!');
                case 'moveToMe':
                    movePlayer(msg);
                case 'moveTo':
                    moveTo(msg);
            }
        }
    }
});

client.login(auth.token);

const movePlayer = (msg: Message) => {
    if (!msg.mentions.users.first()) msg.channel.send("You need to mention a target!");
    else {
        const vChannel = msg.member.voice.channel;
        logger.debug(`Active voice channel: ${vChannel.name.toString()}`);

        const target = getTarget(msg);
        target.voice.setChannel(vChannel);
        logger.info(`Moved ${target.displayName.toString()} to ${vChannel.name.toString()}`);
    }
}

const moveTo = (msg: Message) => {
    if (!msg.mentions.users.first()) msg.channel.send("You need to mention a target!");
    else {
        const userTarget = getTarget(msg);
        const channelTarget = msg.content.split(userTarget.user.toString().substring(3))[msg.content.split(userTarget.user.toString().substring(3)).length - 1].trim();
        logger.debug(`User to move to channel: ${userTarget.displayName.toString()}`);
        logger.debug(`Target voice channel: ${channelTarget.toString()}`);
        const vChannel: VoiceChannel = getVChannelByName(msg.guild, channelTarget);
        if (vChannel != undefined) {
            userTarget.voice.setChannel(vChannel);
            logger.info(`Moved ${userTarget.displayName.toString()} to ${vChannel.name.toString()}`);
        } else {
            msg.reply(`Target channel (${channelTarget}) not found.`);
            logger.warn(`Voice channel (${channelTarget}) not found.`);
        }
    }
}

const getTarget = (msg: Message) => {
    const temp = msg.guild.member(msg.mentions.users.first());
    logger.debug(`Fetched target with name: ${temp.displayName.toString()}`);
    return temp;
}

const getVChannelByName = (guild: Guild, name: String) => {
    let temp: VoiceChannel = undefined;
    guild.channels.cache.forEach(e => {
        logger.silly(`Name: ${e.name}, Type: ${e.type}`)
        if (e.type === 'voice' && compTwoStringsInsensitive(e.name, name)) {
            logger.silly(`Found channel: ${e.name.toString()}`);
            temp = <VoiceChannel> e;
            return;
        }
    })
    return temp;
}

const checkAuth = (msg: Message) => {
    const author = msg.guild.member(msg.author);
    let authorized = false;
    author.roles.cache.forEach(e => {
        if (compTwoStringsInsensitive(e.name, 'BotRights') || compTwoStringsInsensitive(e.name, 'ADMIN')) authorized = true;
    })
    logger.info(`Checked rights for user: ${author.displayName.toString()}. Result: ${authorized}`);
    return authorized;
}
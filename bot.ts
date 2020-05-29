import { MovementBot } from "./bots/movementBot";
import { ChannelBot } from "./bots/channelBot";
const { MoveToken, ChannelToken } = require('./token.json');

const moveBot = new MovementBot();
const channelBot = new ChannelBot();

moveBot.run(MoveToken);
channelBot.run(ChannelToken);

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));
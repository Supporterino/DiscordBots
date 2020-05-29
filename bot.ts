import { MovementBot } from "./bots/movementBot";
import { ChannelBot } from "./bots/channelBot";
let auth = require('./token.json');

const moveBot = new MovementBot();
const channelBot = new ChannelBot();


moveBot.run(auth.MoveToken);
channelBot.run(auth.ChannelToken);
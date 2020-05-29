import { MovementBot } from "./bots/movementBot";
import { ChannelBot } from "./bots/channelBot";
const { MoveToken, ChannelToken } = require('../token.json');


const run = () => {
    const channelBot = new ChannelBot();
    channelBot.run(ChannelToken);

    const moveBot = new MovementBot();
    moveBot.run(MoveToken);
};

run();
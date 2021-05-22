import { MovementBot } from "./bots/movementBot";
import { ChannelBot } from "./bots/channelBot";
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const run = () => {
    console.log(process.env.PWD)
    console.log(process.env.ChannelToken)
    const channelBot = new ChannelBot();
    channelBot.run(process.env.ChannelToken);

    // const moveBot = new MovementBot();
    // moveBot.run(process.env.MoveToken);
};

run();
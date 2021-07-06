import { ChannelBot } from './bots/channelBot';
import dotenv from 'dotenv';
import { MovementBot } from './bots/movementBot';

dotenv.config({ path: '.env' });

const run = () => {
  const channelBot = new ChannelBot();
  channelBot.run(process.env.ChannelToken);

  const moveBot = new MovementBot();
  moveBot.run(process.env.MovementToken);
};

run();

import { PrivateChannelBot } from './bot';
import { logger } from './utils';
import dotenv from 'dotenv';

dotenv.config();
logger.debug(`Retrieving API token from environment variables.`);
const apiToken = process.env.ChannelToken || 'not a token';
logger.debug(`API token is: ${apiToken}.`);
logger.info(`Creating Bots.`);
const bot = new PrivateChannelBot(apiToken);
bot.start();

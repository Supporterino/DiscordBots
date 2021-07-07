import { PrivateChannelBot } from '@/bot';
import { logger } from '@/utils';

logger.debug(`Retrieving API token from environment variables.`);
const apiToken = process.env.ChannelToken;
logger.debug(`API token is: ${apiToken}.`);
logger.info(`Creating Bots.`);
const bot = new PrivateChannelBot(apiToken);
bot.start();

import { PrivateChannelBot } from './executables';
import { EnvLoader, logger } from './utils';

const loader = new EnvLoader();
loader.loadVariable('ChannelToken');
logger.info(`Creating Bots.`);

const bot = new PrivateChannelBot(loader.getVariable('ChannelToken'));
bot.start();

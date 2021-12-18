import { Logger, TLogLevelName } from 'tslog';

const loglevel = process.env.LOG_LEVEL || 'silly';
export const logger = new Logger({
  name: 'discord_bots',
  minLevel: loglevel as TLogLevelName,
  dateTimeTimezone: 'Europe/Berlin'
});

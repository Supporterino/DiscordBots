import { Logger, TLogLevelName } from 'tslog';

const loglevel = process.env.LOG_LEVEL || 'silly';
export const logger = new Logger({
  name: 'pcb_logger',
  minLevel: loglevel as TLogLevelName,
  dateTimeTimezone: 'Europe/Berlin'
});

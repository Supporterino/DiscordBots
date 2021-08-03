import dotenv from 'dotenv';
import { genID, logger } from '.';

export class EnvLoader {
  private __store: Map<string, string>;
  private __id: string;

  constructor() {
    if (process.env.NODE_ENV !== 'production') dotenv.config();
    this.__id = genID();
    this.__store = new Map<string, string>();
    logger.info(`Created new PrivateChannelRegistry with id (${this.__id}).`);
  }

  /**
   * Loads an env var into a local store
   * @param name Name of the env var to load
   * @returns boolean indicating if load was successful
   */
  loadVariable(name: string): boolean {
    const value = process.env[name];
    if (value) {
      this.__store.set(name, value);
      return true;
    } else {
      logger.info(`Couldn't load env var (${name}).`);
      return false;
    }
  }

  /**
   * Returns a loaded env var
   * @param name Name of the env var to load
   * @returns The value of the env var
   */
  getVariable(name: string): string {
    if (this.__store.has(name)) return this.__store.get(name)!;
    else throw new Error(`Tried to load a not stored env var.`);
  }
}

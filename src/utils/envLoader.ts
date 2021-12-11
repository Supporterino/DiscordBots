import dotenv from 'dotenv';
import { genID, logger } from '.';

/**
 * This class is a wrapper for environment variable loading. Based on the NODE_ENV the vars get loaded from `dotenv` or from the real environment
 */
export class EnvLoader {
  private __store: Map<string, string>;
  private __id: string;

  /**
   * Initialize a new EnvLoader
   */
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

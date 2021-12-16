import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { Executable } from '.';
import { genID, logger } from '../utils';
import { checkForCommmonElements } from '../utils/arrayHelper';

/**
 * A simple class which represents a permission handler which uses in memory objects to check if a user has access to a command
 */
export class PermissionHandler implements Executable {
  private __permissions!: Map<string, Array<PERMISSIONS>>;
  private __permissionsMap!: Map<string, Array<PERMISSIONS>>;
  private __path: string;
  private __id: string;
  private __interval: number;

  /**
   * Construct a new PermissionHandler
   * @param interval The desired interval in which the permissions should be written to drive
   */
  constructor(interval: number) {
    this.__id = genID();
    this.__path = 'data/permissionsPersistence.json';
    this.__interval = interval;
    logger.info(`Created PermissionHandler with ID (${this.__id})`);
  }

  /**
   * Brings the PermissionHandler in a functioning state by loading all variables from disk and starting the periodic save to disk
   */
  start(): void {
    this.loadPersistence();
    this.createCommandMap();
    this.registerAdminUsers();
    logger.info(`Starting persistence scheduled write with interval of ${this.__interval / 1000}s`);
    setInterval(() => {
      this.savePersistence();
    }, this.__interval);
  }

  /**
   * Adds an initial ADMIN user to the PermissionHandler
   */
  registerAdminUsers(): void {
    this.addRight('244161825082441729', PERMISSIONS.ADMIN);
  }

  /**
   * This function checks if a user is registered then gets the permissions from the user. It checks if the user has one of the required PERMISSIONS for the given command
   * @param userID The user to check for execution right
   * @param command The command that shall be executed
   * @returns true if the user has access and false if not
   */
  checkRight(userID: string, command: string): boolean {
    logger.debug(`Checking if user ${userID} can execute the command ${command}`);
    if (this.isRegisteredUser(userID)) {
      const perms = this.getUserPermissions(userID);
      if (perms.includes(PERMISSIONS.ADMIN)) return true;
      if (checkForCommmonElements(this.__permissionsMap.get(command)!, perms)) return true;
      else return false;
    } else {
      return false;
    }
  }

  /**
   * Add a permission to a user if he hasn't got it already
   * @param userID the user to manipulate
   * @param newPermission the PERMISSION to add
   */
  addRight(userID: string, newPermission: PERMISSIONS): void {
    if (this.isRegisteredUser(userID)) {
      const perms = this.getUserPermissions(userID);
      if (perms.indexOf(newPermission) == -1) perms.push(newPermission);
      this.updatePermissions(userID, perms);
    } else {
      this.__permissions.set(userID, [newPermission]);
    }
  }

  /**
   * Removes a permission from a user
   * @param userID the user to manipulate
   * @param permission the PERMISSION to remove
   */
  removeRight(userID: string, permission: PERMISSIONS): void {
    if (this.isRegisteredUser(userID)) {
      const perms = this.getUserPermissions(userID);
      const index = perms.indexOf(permission);
      if (index > -1) perms.splice(index, 1);
      this.updatePermissions(userID, perms);
    } else {
      logger.warn(`Can't remove rights from a non registered user ${userID}`);
    }
  }

  /**
   * Writes a new set of permissions for a user to persistence
   * @param userID the user to edit
   * @param permissions the new permissions of the user
   */
  updatePermissions(userID: string, permissions: Array<PERMISSIONS>): void {
    this.__permissions.set(userID, permissions);
  }

  /**
   * Check if a user is registered in the PermissionsHanlder
   * @param userID The user to check
   * @returns boolean indication if user is registered
   */
  isRegisteredUser(userID: string): boolean {
    return this.__permissions.has(userID);
  }

  /**
   * Loads the permissions of a user from the map
   * @param userID the user to load the permissions from
   * @returns Array<PERMISSIONS>
   */
  getUserPermissions(userID: string): Array<PERMISSIONS> {
    const perms = this.__permissions.get(userID);
    if (perms) {
      return perms;
    } else {
      logger.warn(`Couldn't load permissions for user ${userID}`);
      return [];
    }
  }

  /**
   * Loads the saved permissions from the disk or initializes a new map
   */
  loadPersistence(): void {
    if (existsSync(this.__path)) {
      readFile(this.__path, 'utf-8')
        .then((data) => {
          this.__permissions = new Map(JSON.parse(data));
        })
        .catch((err) => {
          logger.prettyError(err);
        });
    } else {
      logger.info(`No persistence found for PermissionHandler at ${this.__path}. Creating new one.`);
      this.__permissions = new Map<string, Array<PERMISSIONS>>();
    }
  }

  /**
   * Writes the permissions map to disk
   */
  savePersistence(): void {
    writeFile(this.__path, JSON.stringify(Array.from(this.__permissions.entries())), 'utf-8')
      .then((_data) => {
        logger.info('Persistence written');
      })
      .catch((err) => {
        logger.prettyError(err);
      });
  }

  /**
   * Creates the map which permission is needed to execute the command
   */
  createCommandMap(): void {
    this.__permissionsMap = new Map<string, Array<PERMISSIONS>>();
    this.__permissionsMap.set('rename', [PERMISSIONS.ALL, PERMISSIONS.RENAME]);
    this.__permissionsMap.set('create_private_channel', [PERMISSIONS.ALL, PERMISSIONS.CHANNEL_CREATE]);
    this.__permissionsMap.set('move_here', [PERMISSIONS.ALL, PERMISSIONS.MOVE]);
    this.__permissionsMap.set('vote', [PERMISSIONS.ALL, PERMISSIONS.VOTE]);
  }
}

/**
 * Enum of the possible permissions a user can have
 */
export enum PERMISSIONS {
  ALL,
  ADMIN,
  MOVE,
  RENAME,
  CHANNEL_CREATE,
  VOTE
}

/**
 * This function maps a string to it PERMISSION representiv. If the string doesn't match a PERMISSION an Error is thrown
 * @param name the string to transform to a permission
 * @returns the requested PERMISSION
 */
export const getPermissionByString = (name: string): PERMISSIONS => {
  switch (name.toLowerCase()) {
    case 'all':
      return PERMISSIONS.ALL;
    case 'admin':
      return PERMISSIONS.ADMIN;
    case 'move':
      return PERMISSIONS.MOVE;
    case 'rename':
      return PERMISSIONS.RENAME;
    case 'channel':
      return PERMISSIONS.CHANNEL_CREATE;
    case 'vote':
      return PERMISSIONS.VOTE;
    default:
      throw new TypeError(`String (${name}) doesn't match a PERMISSION`);
      break;
  }
};

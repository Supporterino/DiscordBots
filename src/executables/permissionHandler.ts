import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { Executable } from '.';
import { genID, logger } from '../utils';
import { checkForCommmonElements } from '../utils/arrayHelper';

export class PermissionHandler implements Executable {
  private __permissions!: Map<string, Array<PERMISSIONS>>;
  private __permissionsMap!: Map<string, Array<PERMISSIONS>>;
  private __path: string;
  private __id: string;
  private __interval: number;

  constructor(interval: number) {
    this.__id = genID();
    this.__path = 'data/permissionsPersistence.json';
    this.__interval = interval;
    logger.info(`Created PermissionHandler with ID (${this.__id})`);
  }

  start(): void {
    this.loadPersistence();
    this.createCommandMap();
    this.registerAdminUsers();
    logger.info(`Starting persistence scheduled write with interval of ${this.__interval / 1000}s`);
    setInterval(() => {
      this.savePersistence();
    }, this.__interval);
  }

  registerAdminUsers(): void {
    this.addRight('244161825082441729', PERMISSIONS.ADMIN);
  }

  checkRight(userID: string, command: string): boolean {
    if (this.isRegisteredUser(userID)) {
      const perms = this.getUserPermissions(userID);
      if (checkForCommmonElements(this.__permissionsMap.get(command)!, perms)) return true;
      else return false;
    } else {
      return false;
    }
  }

  addRight(userID: string, newPermission: PERMISSIONS): void {
    if (this.isRegisteredUser(userID)) {
      const perms = this.getUserPermissions(userID);
      if (perms.indexOf(newPermission) == -1) perms.push(newPermission);
      this.updatePermissions(userID, perms);
    } else {
      this.__permissions.set(userID, [newPermission]);
    }
  }

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

  updatePermissions(userID: string, permissions: Array<PERMISSIONS>): void {
    this.__permissions.set(userID, permissions);
  }

  isRegisteredUser(userID: string): boolean {
    return this.__permissions.has(userID);
  }

  getUserPermissions(userID: string): Array<PERMISSIONS> {
    const perms = this.__permissions.get(userID);
    if (perms) {
      return perms;
    } else {
      logger.warn(`Couldn't load permissions for user ${userID}`);
      return [];
    }
  }

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

  savePersistence(): void {
    writeFile(this.__path, JSON.stringify(Array.from(this.__permissions.entries())), 'utf-8')
      .then((_data) => {
        logger.info('Persistence written');
      })
      .catch((err) => {
        logger.prettyError(err);
      });
  }

  createCommandMap(): void {
    this.__permissionsMap = new Map<string, Array<PERMISSIONS>>();
    this.__permissionsMap.set('rename', [PERMISSIONS.ALL, PERMISSIONS.ADMIN, PERMISSIONS.RENAME]);
    this.__permissionsMap.set('create_private_channel', [PERMISSIONS.ALL, PERMISSIONS.ADMIN, PERMISSIONS.CHANNEL_CREATE]);
    this.__permissionsMap.set('move_here', [PERMISSIONS.ALL, PERMISSIONS.ADMIN, PERMISSIONS.MOVE]);
    this.__permissionsMap.set('vote', [PERMISSIONS.ALL, PERMISSIONS.ADMIN, PERMISSIONS.VOTE]);
  }
}

export enum PERMISSIONS {
  ALL,
  ADMIN,
  MOVE,
  RENAME,
  CHANNEL_CREATE,
  VOTE
}

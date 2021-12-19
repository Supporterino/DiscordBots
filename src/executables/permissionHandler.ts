import { BOOLEAN, Model, ModelCtor, Sequelize, STRING } from 'sequelize';
import { Executable } from '.';
import { genID, logger } from '../utils';

/**
 * A simple class which represents a permission handler which uses in memory objects to check if a user has access to a command
 */
export class PermissionHandler implements Executable {
  private __permissionsMap!: Map<string, Array<PERMISSIONS>>;
  private __id: string;
  private __dbConnection!: Sequelize;
  private __permsDB!: ModelCtor<Model<any, any>>;

  /**
   * Construct a new PermissionHandler
   * @param interval The desired interval in which the permissions should be written to drive
   */
  constructor() {
    this.__id = genID();
    logger.info(`Created PermissionHandler with ID (${this.__id})`);
  }

  initDatabase(): void {
    this.__dbConnection = new Sequelize('permissionsDB', 'user', 'password', {
      host: 'localhost',
      dialect: 'sqlite',
      logging: true,
      storage: 'data/permsDB.sqlite'
    });
    this.loadModel();
  }

  loadModel(): void {
    this.__permsDB = this.__dbConnection.define('permissions', {
      id: {
        type: STRING,
        unique: true,
        primaryKey: true
      },
      admin: { type: BOOLEAN, defaultValue: false },
      all: { type: BOOLEAN, defaultValue: false },
      move: { type: BOOLEAN, defaultValue: false },
      rename: { type: BOOLEAN, defaultValue: false },
      channel: { type: BOOLEAN, defaultValue: false },
      vote: { type: BOOLEAN, defaultValue: false }
    });
    this.__permsDB.sync({ alter: true });
  }

  /**
   * Brings the PermissionHandler in a functioning state by loading all variables from disk and starting the periodic save to disk
   */
  start(): void {
    this.initDatabase();
    this.createCommandMap();
    this.registerAdminUsers();
  }

  /**
   * Adds an initial ADMIN user to the PermissionHandler
   */
  registerAdminUsers(): void {
    this.__permsDB
      .findOrCreate({
        where: { id: '244161825082441729' },
        defaults: {
          admin: true
        }
      })
      .then(([user, created]) => {
        if (created) logger.info(`AdminUser (${user.getDataValue('id')}) was created`);
        else logger.debug(`AdminUser (${user.getDataValue('id')}) was already present`);
      });
    this.__permsDB.update({ admin: true }, { where: { id: '244161825082441729' } });
  }

  /**
   * This function checks if a user is registered then gets the permissions from the user. It checks if the user has one of the required PERMISSIONS for the given command
   * @param userID The user to check for execution right
   * @param command The command that shall be executed
   * @returns true if the user has access and false if not
   */
  async checkRight(userID: string, command: string): Promise<boolean> {
    logger.debug(`Checking if user ${userID} can execute the command ${command}`);
    const [user, created] = await this.__permsDB.findOrCreate({ where: { id: userID } });

    if (created) return false;
    if (user.getDataValue('admin')) return true;
    if (user.getDataValue('all')) return true;
    let match = false;
    this.__permissionsMap.get(command)!.forEach((perm: PERMISSIONS) => {
      if (user.getDataValue(getStringForPermission(perm))) match = true;
    });
    return match;
  }

  /**
   * Add a permission to a user if he hasn't got it already
   * @param userID the user to manipulate
   * @param newPermission the PERMISSION to add
   */
  addRight(userID: string, newPermission: PERMISSIONS): void {
    const key = getStringForPermission(newPermission);
    this.__permsDB.update({ [key]: true }, { where: { id: userID } });
  }

  /**
   * Removes a permission from a user
   * @param userID the user to manipulate
   * @param permission the PERMISSION to remove
   */
  removeRight(userID: string, permission: PERMISSIONS): void {
    const key = getStringForPermission(permission);
    this.__permsDB.update({ [key]: false }, { where: { id: userID } });
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

export const getStringForPermission = (perm: PERMISSIONS): string => {
  switch (perm) {
    case PERMISSIONS.ALL:
      return 'all';
    case PERMISSIONS.ADMIN:
      return 'admin';
    case PERMISSIONS.CHANNEL_CREATE:
      return 'channel';
    case PERMISSIONS.MOVE:
      return 'move';
    case PERMISSIONS.RENAME:
      return 'rename';
    case PERMISSIONS.VOTE:
      return 'vote';
    default:
      return 'none';
  }
};

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

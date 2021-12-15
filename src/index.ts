import { DocsProvider, Executable, TheBot, Updater } from './executables';
import { PermissionHandler } from './executables/permissionHandler';
import { EnvLoader } from './utils';

const executables = new Array<Executable>();
const loader = new EnvLoader();
const to_load = ['Token', 'enableDocs', 'RestToken', 'ID', 'VoteTimeout', 'VoteTime', 'GuildID', 'PersistenceInterval'];
to_load.forEach((envVar) => {
  loader.loadVariable(envVar);
});

const handler = new PermissionHandler(+loader.getVariable('PersistenceInterval'));
executables.push(handler);
executables.push(new Updater(loader.getVariable('Token'), loader.getVariable('ID'), loader.getVariable('GuildID')));
executables.push(new TheBot(loader.getVariable('Token'), loader, handler));

if (loader.getVariable('enableDocs') === 'True') executables.push(new DocsProvider(loader));

executables.forEach((binary) => {
  binary.start();
});

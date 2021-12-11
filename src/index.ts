import { DocsProvider, Executable, TheBot, Updater } from './executables';
import { EnvLoader } from './utils';

const executables = new Array<Executable>();
const loader = new EnvLoader();
const to_load = ['Token', 'enableDocs', 'RestToken', 'ID', 'VoteTimeout', 'VoteTime', 'GuildID'];
to_load.forEach((envVar) => {
  loader.loadVariable(envVar);
});

executables.push(new Updater(loader.getVariable('Token'), loader.getVariable('ID'), loader.getVariable('GuildID')));
executables.push(new TheBot(loader.getVariable('Token'), loader));

if (loader.getVariable('enableDocs') === 'True') executables.push(new DocsProvider(loader));

executables.forEach((binary) => {
  binary.start();
});

import { DocsProvider, Executable, PrivateChannelBot, Updater } from './executables';
import { EnvLoader } from './utils';

const executables = new Array<Executable>();
const loader = new EnvLoader();
loader.loadVariable('ChannelToken');
loader.loadVariable('enableDocs');
loader.loadVariable('RestToken');
loader.loadVariable('ID');
loader.loadVariable('VoteTimeout');
loader.loadVariable('VoteTime');

executables.push(new Updater(loader.getVariable('ChannelToken'), loader.getVariable('ID')));
executables.push(new PrivateChannelBot(loader.getVariable('ChannelToken'), loader));

if (loader.getVariable('enableDocs') === 'True') executables.push(new DocsProvider(loader));

executables.forEach((binary) => {
  binary.start();
});

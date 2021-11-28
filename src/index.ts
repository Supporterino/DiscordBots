import { DocsProvider, Executable, PrivateChannelBot, Updater } from './executables';
import { EnvLoader } from './utils';

const executables = new Array<Executable>();
const loader = new EnvLoader();
loader.loadVariable('ChannelToken');
loader.loadVariable('enableDocs');
loader.loadVariable('RestToken');
loader.loadVariable('ID');

executables.push(new Updater(loader.getVariable('ChannelToken'), loader.getVariable('ID')));
executables.push(new PrivateChannelBot(loader.getVariable('ChannelToken')));

if (loader.getVariable('enableDocs') === 'True') executables.push(new DocsProvider(loader));

executables.forEach((binary) => {
  binary.start();
});

import { DocsProvider, Executable, PrivateChannelBot } from './executables';
import { EnvLoader } from './utils';

const executables = new Array<Executable>();
const loader = new EnvLoader();
loader.loadVariable('ChannelToken');
//loader.loadVariable('RenamerToken');
loader.loadVariable('enableDocs');

executables.push(new PrivateChannelBot(loader.getVariable('ChannelToken')));
//executables.push(new Renamer(loader.getVariable('RenamerToken')));

if (loader.getVariable('enableDocs') === 'True') executables.push(new DocsProvider(loader));

executables.forEach((binary) => {
  binary.start();
});

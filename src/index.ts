import { DocsProvider, PrivateChannelBot } from './executables';
import { Executable } from './executables/executable';
import { EnvLoader } from './utils';

const executables = new Array<Executable>();
const loader = new EnvLoader();
loader.loadVariable('ChannelToken');
loader.loadVariable('enableDocs');

executables.push(new PrivateChannelBot(loader.getVariable('ChannelToken')));

if (loader.getVariable('enableDocs') === 'True') executables.push(new DocsProvider(loader));

executables.forEach((binary) => {
  binary.start();
});

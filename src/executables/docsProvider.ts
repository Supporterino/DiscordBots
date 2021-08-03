import { Executable } from './executable';
import express from 'express';
import helmet from 'helmet';
import { EnvLoader, logger } from '../utils';

export class DocsProvider extends Executable {
  __app: express.Application;
  __loader: EnvLoader;
  __port!: string;

  constructor(l: EnvLoader) {
    super();
    this.__app = express();
    this.__loader = l;
    this.configure();
  }

  start() {
    this.__app.listen(this.__port, () => {
      logger.info(`Started DocsProvier on port ${this.__port}.`);
    });
  }

  private configure() {
    this.__loader.loadVariable('docsPort');
    this.__port = this.__loader.getVariable('docsPort');

    this.__app.use(helmet());
    this.__app.use(express.static('./docs'));
    this.__app.enable('trust proxy');
  }
}

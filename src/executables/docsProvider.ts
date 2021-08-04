import { Executable } from '.';
import express from 'express';
import helmet from 'helmet';
import { EnvLoader, logger } from '../utils';

export class DocsProvider implements Executable {
  __app: express.Application;
  __loader: EnvLoader;
  __port!: string;

  constructor(l: EnvLoader) {
    this.__app = express();
    this.__loader = l;
    this.configure();
  }

  /**
   * Starts the created web server with the stored configuration. `configure()` should be called before this function.
   */
  start() {
    this.__app.listen(this.__port, () => {
      logger.info(`Started DocsProvier on port ${this.__port}.`);
    });
  }

  /**
   * This function configures the underlying web server of the class. It loads the port to use from the env var `docsPort` via the provided EnvLoader.
   */
  private configure() {
    this.__loader.loadVariable('docsPort');
    this.__port = this.__loader.getVariable('docsPort');

    this.__app.use(helmet());
    this.__app.use('/discordBots', express.static('./docs'));
    this.__app.enable('trust proxy');
  }
}

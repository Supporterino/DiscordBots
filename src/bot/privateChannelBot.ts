import { PrivateChannelRegistry } from '../registry';

export class PrivateChannelBot {
  private token: string;
  private registry: PrivateChannelRegistry;

  constructor(t: string) {
    this.token = t;
  }

  public start(): void {
    this.registry = new PrivateChannelRegistry();
  }
}

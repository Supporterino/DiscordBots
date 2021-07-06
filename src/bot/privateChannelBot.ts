import { Client, Intents } from 'discord.js';
import { PrivateChannelRegistry } from '../registry';
export class PrivateChannelBot {
  private __token: string;
  private __registry: PrivateChannelRegistry;
  private __client: Client;

  constructor(tok: string) {
    this.__token = tok;
  }

  public start(): void {
    this.__registry = new PrivateChannelRegistry();
    this.createClient();
  }

  private createClient(): void {
      this.__client = new Client({
          presence: {
              status: 'online',
              activities: [
                  {
                      name: 'Waiting to serve your requests',
                      type: 'LISTENING'
                  }
              ]
          },
          intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_BANS,
            Intents.FLAGS.GUILD_EMOJIS,
            Intents.FLAGS.GUILD_INTEGRATIONS,
            Intents.FLAGS.GUILD_INVITES,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_MESSAGE_TYPING,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_WEBHOOKS
          ]
      })
  }
}

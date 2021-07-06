import { CommandInteraction, Guild } from "discord.js";

export class ChannelRequest {
    private __guild: Guild;
    private __command: CommandInteraction;

    constructor(cmd: CommandInteraction) {
        this.__command = cmd;
    }
}

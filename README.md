# DiscordBots
This repository houses a discord bot written in typescript with the discord.js library based on the lasted `master` build. The bot is primarly written for use on a private discord server. But this repository can be used as a good template to
develop your own bot or extend the existing one with you desired function. The structure of the project and the usecase of each component is described at [the project structure](#project-structure).

## Documentation
The project relies on typedoc and all code should be usable with the written typedoc so no further documentation is provided.
## Functionality
As is the bot provides two main functionalities.
### Private Channels
The main functionality of the bot is to create a private channel for a user on demand. For the bot to function correctly some prerequisits must be met:
* The server has a channel named `AFK` where all users are moved to if a private channel is disbanded.
* A category named `Private Channels`. Under this category all private channels get created.
* A text channel where the user can interact with the bot.

The private channels created by the bot are invisible to other users. To create a private channel the user can use the `/create_channel`. The command doesn't need any arguments but you can optionaly provied a channel name under the option key `channelname` and mention up to three users under the option key `user1-3`. On command execution the private channel is created and the owner and all mentioned users are moved to the channel.
### Move Commands
To make the [channels](#private-channels) more usable the bot provides a two additional commands. The `move_here` command which requires the user to mention a target user which gets moved to the users channel. The `move_to` command which requires a mentioned target user and a channelname. The mentioned user gets moved to the targeted channel.
## Logging
The project uses a centalized logger which is provided from the utils package. The logger can be imported with this statement:
```ts
import { logger } from '../utils';
```
The logger is based on the npm package `ts-node` and provides the typical five logging levels. The logger is able to print stacktraces or objects in a pretty form with your log message. To do so chain you element to the log message or pretty print the error.
```ts
// Print a log entry with a JSON Object
logger.debug(`I am logging a object to check its values.`, my_object);

// Print a error with a pretty stacktrace
logger.prettyError(new Error(`Oh no something has gone wrong here.`));
```
## project structure
The project is separeted into folders. Each folder represents a logical group of code with a barrel `index.ts` exporting all external facing functions. At the moment there are four folders. Each is exlpained in a subsection below. Folders:
|Folder|Usage|
|------|-----|
|bot|This logical group holds the primary bot class. Inside this class all needed subcomponents are initialized and the connection to Discord is established. The bot class should catch the command or what ever you are listening to from your bot and create a corresponding request instance and execute it.|
|registry|Classes inside this group provied registrys which hold data for the bot which are needed outside the lifecycle of a single request.|
|requests|A request is a class which is instantiated by the bot when the associated command or what ever is called. A request should handle all logic needed the complete it.|
|utils|The `utils` group provides functions which aren't directly associated with a class or which are needed inside multiple classes. A example is the `guildFunctions.ts` which provides wrapper functions to ineract with a Discord server (Guild).|
  
The main `index.ts` file is simple wrapper for the bot. It loads your Discord API Token either from a `.env` file for development purposes or from the environment variable `ChannelToken` and then initializes the bot with the token.

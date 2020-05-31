# Discord Bots <!-- omit in toc -->

This is a node project written in TypeScript. The project has a base class used to build multiple discord bots with the same base and a corresponding logger.

# Table of Contents <!-- omit in toc -->
- [Introduction](#introduction)
- [The Bots](#the-bots)
  - [PrivateChannel Bot](#privatechannel-bot)
    - [Functionalities](#functionalities)
    - [Commands](#commands)
  - [Movement Bot](#movement-bot)
- [Usage](#usage)
  - [Development](#development)
  - [Deployment](#deployment)
  - [Documentation](#documentation)
- [Code explanation](#code-explanation)
  - [BasicBot class](#basicbot-class)
  - [ChannelBot class](#channelbot-class)
  - [MovementBot class](#movementbot-class)

# Introduction
The intend of this repo was to host the code of some discord bots which were created for my server as QoL updates. Since if found the discord api quite intressting to work with and put some time in it to write "readable" code, I thought i put this repo to public in case someone else sees some use in these bots. Also contributions are very welcome.
Besides the documentation of the bots inside this readme, the source code is documented with typedoc. So you can utilies the typedoc dev dependency to build an documentation [How to build TypeDoc](#documentation).

# The Bots
In this section the diffrent bots are described and there commands are listed.
## PrivateChannel Bot
The PrivateChannel Bot can be found inside the channelBot.ts file. The aim of this bot is to give the users the opportunity to create a private channel on the fly.
### Functionalities
The bot allows the user to create a private channel. The created channel is not visible to other people. Upon creating the channel the creator gets moved in side the channel. If the creator leaves the channel all users inside the channel get moved to a predefined channel (can be adjusted in source code [(See here)](#channelbot-class)) and the channel gets deleted.
### Commands
| Command                            | Description                                                                                                                                                                                                                                                                                                                                      |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| !channelHelp                       | This command replys to a user with the possible commands which can be execute by this bot with a short explanation                                                                                                                                                                                                                               |
| !channelCreate ?name ?\[mentions\] | This command let's the user create a private channel. As a first argument the user can specify a name for the channel, if no name is provided the channel gets named: Username's Channel. The second argument can be any number of mentions. If the mentioned users are active in a voice channel they get moved in the private channel as well. |
## Movement Bot
The Movement Bot is located inside the movementBot.ts. This Bot allows a user to execute basic move functionalities for users in an active voice channel. The access to the Bot is controlled by GuildRoles, the user which wants to have access to the bot must be in a specified role of the server (the roles with access can be defined in the source code [(See here)](#movementbot-class)).

# Usage
## Development
Since it isn't best practice to execute TypeScript as a Node.js application directly and this project is written in TypeScrit there is an additional way to execute the project for development purposes.

You can start the bots with the command: `npm run start-dev`. This command utilises the `ts-node` npm package to run the TypeScript files to skip the process of compiling them to JavaScript to execute it.
## Deployment
For using the bots in a productive environment their are two commands for use inside the `package.json`.
```bash
npm run build
```
This command will compile the TypeScript project into JavaScript files which are placed inside the directory `build`. It is still a node module at this point and has to be executed with `node ./build/bot.js`.
```bash
npm run start
```
This command extends the build command and starts the bots with the previous mentioned command.
## Documentation
The indepth documentation of the repo can be build with the following command:
```bash
npx typedoc --options "typedoc.json"
```
This will generate a new directory named `docs`, inside this directory is a webpage with the entrypoint `index.html`. The options for typedoc can be adjusted inside the `typedoc.json`.
```json
{
    "inputFiles": ["./src"],
    "mode": "modules",
    "out": "docs",
    "entryPoint": "./src/bot.ts",
    "includeVersion": "true",
    "name": "Discord Bots",
    "readme": "./README.md"
}
```
| Option         | Effect                                                                                 |
| :------------- | :------------------------------------------------------------------------------------- |
| inputFiles     | Base directory of the sourcecode.                                                      |
| mode           | The kind of code found inside the source directory.                                    |
| out            | Name of the folder to store the documentation inside.                                  |
| entryPoint     | Main TypeScript file of the project.                                                   |
| includeVersion | Includes the version tag from the `package.json` insode the title of the documentation |
| name           | Name of the docmentation                                                               |
| readme         | Path to the readme file, can be `none` to exclude the readme.                          |

More options for the `typedoc.json` can be found [here](https://typedoc.org/guides/options/).
# Code explanation
## BasicBot class
## ChannelBot class
## MovementBot class

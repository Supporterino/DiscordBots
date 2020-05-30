# Discord Bots <!-- omit in toc -->

This is a node project written in TypeScript. The project has a base class used to build multiple discord bots with the same base and a corresponding logger.

# Table of Contents <!-- omit in toc -->
- [Introduction](#introduction)
- [The Bots](#the-bots)
  - [PrivateChannel Bot](#privatechannel-bot)
    - [Functionalities](#functionalities)
    - [Commands](#commands)
- [Usage](#usage)
- [Code explanation](#code-explanation)
  - [BasicBot class](#basicbot-class)

# Introduction
The intend of this repo was to host the code of some discord bots which were created for my server as QoL updates. Since if found the discord api quite intressting to work with and put some time in it to write "readable" code, I thought i put this repo to public in case someone else sees some use in these bots. Also contributions are very welcome.

# The Bots
In this section the diffrent bots are described and there commands are listed.
## PrivateChannel Bot
The PrivateChannel Bot can be found inside the channelBot.ts file. The aim of this bot is to give the users the opprtunity to create a private channel on the fly.
### Functionalities
The bot allows the user to create a private channel. The created channel is not visible to other people. Upon creating the channel the creator gets moved in side the channel. If the creator leaves the channel all users inside the channel get moved to a predefined channel (can be adjusted in source code) and the channel gets deleted.
### Commands
| Command                          | Description                                                                                                        |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| !channelHelp                     | This command replys to a user with the possible commands which can be execute by this bot with a short explanation |
| !channelCreate ?name ?[mentions] | This command let's the user create a private channel                                                               |

# Usage
# Code explanation
## BasicBot class

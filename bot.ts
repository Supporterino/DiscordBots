import { MovementBot } from "./bots/movementBot";

var auth = require('./token.json');

let moveBot = new MovementBot();
moveBot.run(auth.token);
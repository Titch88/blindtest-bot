const Discord = require("discord.js");
require("dotenv").config();

import commands from "./commands";
import { isCommand } from "./helpers";
// Create an instance of a Discord client
const client = new Discord.Client();

const owner = process.env.OWNER;
const self = process.env.CLIENTID;

client.game = {
  currentlyPlaying: false,
  voiceChannel: null,
  voiceConnection: null,
  textChannel: null,

  // {name : "name of the song", url: 'url of youtube link'}
  songList: [],
  // {name : "name of the player", score : int}
  players: []
};

const onMessageHandler = async message => {
  const { channel, author, content } = message;
  // ignoring message from himself
  if (author.id === self) return;

  if (isCommand(content)) {
    const [commandName, ...args] = content.trim().split(" ");

    const command = commands.find(({ trigger }) =>
      commandName.includes(trigger)
    );
    console.log(commands);
    if (command) {
      const answer = command.action(client, args, author, message);
      if (answer) {
        channel.send(answer);
      }
    }
  } else if (client.game.currentlyPlaying) {
    // handling user responses
  }
};

// Create an event listener for messages
client.on("message", onMessageHandler);

client.on("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);

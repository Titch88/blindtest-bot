//eslint-disable-next-line
require("dotenv").config();

import Discord from "discord.js";
import fuzz from "fuzzball";

import commands from "./commands";
import { isCommand, wait, playUrl, getScoreboard } from "./helpers";
// Create an instance of a Discord client
const client = new Discord.Client();

const self = process.env.CLIENTID;

client.game = {
  currentlyPlaying: false,
  voiceChannel: null,
  voiceConnection: null,
  textChannel: null,

  // {name : "name of the song", url: 'url of youtube link'}
  songList: [],
  currentSongIndex: 0,
  // {[nick] : score }
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
    console.log(commandName);
    if (commandName === "!help") {
      const answer = commands.reduce(
        (acc, { help }) => `${acc}\n${help}`,
        "\n"
      );
      channel.send(answer);
    } else if (command) {
      const answer = await command.action(client, args, author, message);
      if (answer) {
        channel.send(answer);
      }
    }
  } else if (
    client.game.currentlyPlaying &&
    channel.id === client.game.textChannel.id
  ) {
    const currentIndex = client.game.currentSongIndex;
    const currentAnswer = client.game.songList[currentIndex].name;
    const ratio = fuzz.ratio(currentAnswer, content);
    console.log(fuzz.ratio(currentAnswer, content), currentAnswer, content);
    if (ratio > 50) {
      channel.send(
        `Bonne réponse de ${author.username}. La reponse était : ${currentAnswer}. (Ratio : ${ratio})`
      );
      client.game = {
        ...client.game,
        players: {
          ...client.game.players,
          [author.username]: (client.game.players[author.username] || 0) + 1
        },
        currentSongIndex: client.game.currentSongIndex + 1
      };
      await wait(2000);

      // check if game is over
      if (client.game.currentSongIndex === client.game.songList.length) {
        channel.send(`Partie terminée`);
        client.game.streamer.destroy();
        channel.send(getScoreboard(client.game.players));
      } else {
        channel.send(`Chanson suivante`);
        client.game.streamer.destroy();
        await wait(2000);
        client.game.streamer = playUrl(
          client.game.songList[client.game.currentSongIndex].url,
          client.game.voiceConnection
        );
      }
    }
  }
};

// Create an event listener for messages
client.on("message", onMessageHandler);

client.on("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);

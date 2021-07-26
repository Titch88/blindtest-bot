//eslint-disable-next-line
require("dotenv").config();

import Discord from "discord.js";

import commands from "./commands";
import { isCommand, goToNextSong, smartRatio } from "./helpers";
// Create an instance of a Discord client
const client = new Discord.Client();

const self = process.env.CLIENTID;

const MIN_RATIO = 70;

client.game = {
  currentlyPlaying: false,
  voiceChannel: null,
  voiceConnection: null,
  textChannel: null,
  titleFound: false,
  artistFound: false,
  goToNextSong: false,

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
    const currentAnswer =
      client.game.songList[client.game.currentSongIndex].name;

    console.log(currentAnswer, typeof currentAnswer);

    if (typeof currentAnswer === "string") {
      const ratio = smartRatio(currentAnswer, content);
      console.log(smartRatio(currentAnswer, content), currentAnswer, content);

      if (ratio > MIN_RATIO) {
        channel.send(
          `Bonne réponse de ${author.username}. La reponse était : ${currentAnswer}. (Ratio : ${ratio})`
        );
        client.game = {
          ...client.game,
          goToNextSong: true,
          players: {
            ...client.game.players,
            [author.username]: (client.game.players[author.username] || 0) + 1
          }
        };
      }
    } else if (typeof currentAnswer === "object") {
      const ratioTitle = smartRatio(currentAnswer.title, content);
      const ratioArtist = smartRatio(currentAnswer.artist, content);
      console.log("ratioTitle", ratioTitle, "ratioArtist", ratioArtist);
      if (ratioTitle > MIN_RATIO && ratioArtist > MIN_RATIO) {
        channel.send(
          `Bonne réponse de ${author.username}. La reponse était : ${currentAnswer.artist} - ${currentAnswer.title}.`
        );
        client.game = {
          ...client.game,
          goToNextSong: true,
          players: {
            ...client.game.players,
            [author.username]: (client.game.players[author.username] || 0) + 2
          }
        };
      } else if (ratioTitle > MIN_RATIO) {
        channel.send(
          `Bonne réponse de ${author.username}. La reponse était : ${
            currentAnswer.title
          }. ${
            client.game.artistFound ? "" : "Il faut encore trouver l'artiste !"
          }`
        );
        client.game = {
          ...client.game,
          titleFound: true,
          goToNextSong: client.game.artistFound,
          players: {
            ...client.game.players,
            [author.username]: (client.game.players[author.username] || 0) + 1
          }
        };
      } else if (ratioArtist > MIN_RATIO) {
        channel.send(
          `Bonne réponse de ${author.username}. La reponse était : ${
            currentAnswer.artist
          }. ${
            client.game.titleFound ? "" : "Il faut encore trouver le titre !"
          }`
        );
        client.game = {
          ...client.game,
          artistFound: true,
          goToNextSong: client.game.titleFound,
          players: {
            ...client.game.players,
            [author.username]: (client.game.players[author.username] || 0) + 1
          }
        };
      }
    }

    if (client.game.goToNextSong) {
      await goToNextSong(client, channel);
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

import { buildPlaylist, wait, playUrl, getScoreboard } from "./helpers";

// create a game, expect a playlist youtube. can be overwritten.
// will use the vocal channel and the text channel the user is currently in

const createGame = {
  trigger: "!newgame",
  action: async (client, args, author, message) => {
    /*if (!message.member.voice.channel) {
      return "vous devez être dans un salon vocal pour creer une partie !";
    } else*/ if (
      args.length !== 1
    ) {
      return "un seul argument attendu";
    } else {
      const songList = await buildPlaylist(args[0]);
      client.game = {
        ...client.game,
        voiceChannel: message.member.voice.channel,
        textChannel: message.channel,
        songList
      };
      return `Nouvelle partie demarrée. La playlist contient ${songList.length} chansons.`;
    }
  }
};

// connect the bot to the vocal chan, and starts waiting for answers
const launchGame = {
  trigger: "!launchgame",
  action: async (client, args, author, message) => {
    const voiceConnection = await message.member.voice.channel.join();
    client.game = {
      ...client.game,
      voiceConnection,
      currentlyPlaying: true
    };
    wait(1000).then(() => {
      message.channel.send("La partie demarre !");
      client.game = {
        ...client.game,
        streamer: playUrl(client.game.songList[0].url, voiceConnection)
      };
    });

    return "la partie va demarrer dans 10s";
  }
};

const getScore = {
  trigger: "!score",
  action: async (client, args, author) => {
    return getScoreboard(client.game.players);
  }
};

// not working
const setVolume = {
  trigger: "!volume",
  action: async (client, args) => {
    await client.game.streamer.setVolume(Number(args[1]));
    return "Done";
  }
};

// end a game, only works if it was already launched

const endGame = {
  trigger: "!endgame",
  action: async (client, args, author) => {
    return "ok";
  }
};

export default [createGame, launchGame, getScore, endGame];

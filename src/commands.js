import { buildPlaylist } from "./helpers";

// create a game, expect a playlist youtube. can be overwritten.
// will use the vocal channel and the text channel the user is currently in

const createGame = {
  trigger: "!newgame",
  action: (client, args, author, message) => {
    /*if (!message.member.voice.channel) {
      return "vous devez être dans un salon vocal pour creer une partie !";
    } else*/ if (
      args.length !== 1
    ) {
      return "un seul argument attendu";
    } else {
      client.game = {
        ...client.game,
        voiceChannel: message.member.voice.channel,
        textChannel: message.channel,
        songList: buildPlaylist(args[0])
      };
    }
    return null;
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
    return "ok";
  }
};

const getScore = {
  trigger: "!score",
  action: (client, args, author) => {}
};

// end a game, only works if it was already launched

const endGame = {
  trigger: "!endgame",
  action: (client, args, author) => {
    return "ok";
  }
};

export default [createGame, launchGame, getScore, endGame];

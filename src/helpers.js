import ytdl from "ytdl-core";
import ytpl from "ytpl";
import getArtistTitle from "get-artist-title";
import fuzz from "fuzzball";

export const isCommand = (content) => content[0] === "!";

const sanitizeTitle = (title) => {
  return title
    .replace(/\([^()]*\)/g, "")
    .replace(/official music video/gi, "")
    .replace(/official lyrics video/gi, "")
    .replace(/official audio/gi, "")
    .replace(/official video/gi, "")
    .replace(/official/gi, "")
    .replace(/| napalm records/gi, "")
    .replace(/officiel/gi, "")
    .replace(/ ost /gi, "")
    .replace(/credits/gi, "")
    .replace(/original soundtrack/gi, "");
};

// building the playlist object
export const buildPlaylist = async (youtubeUrl) => {
  const playlist = await ytpl(youtubeUrl);
  const result = playlist.items.map(({ title, shortUrl }) => {
    const sanitizedTitle = sanitizeTitle(title);
    const extracted = getArtistTitle(sanitizedTitle, {
      defaultArtist: "",
      defaultTitle: "",
    });
    const name = extracted
      ? {
          artist: extracted[0],
          title: extracted[1],
        }
      : sanitizedTitle;
    return {
      name,
      url: shortUrl,
    };
  });
  return result;
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const playUrl = (url, connection) => {
  const stream = ytdl(url, { filter: "audioonly" });
  const dispatcher = connection.play(stream, {
    seek: 20,
    volume: 0.5,
  });
  return dispatcher;
};

export const getScoreboard = (players) => {
  return Object.entries(players)
    .sort((a, b) => (a[1] > b[1] ? -1 : 1))
    .reduce((acc, [nick, score]) => {
      return `${acc}${nick} - ${score} points\n`;
    }, "\n");
};

/*
currentlyPlaying: false,
voiceChannel: null,
voiceConnection: null,
textChannel: null,

// {name : "name of the song", url: 'url of youtube link'}
songList: [],
currentSongIndex: 0,
// {[nick] : score }
players: []
*/

export const resetState = (client) => {
  if (client.game.voiceConnection) client.game.voiceConnection.disconnect();
  client.game = {
    currentlyPlaying: false,
    voiceChannel: null,
    voiceConnection: null,
    textChannel: null,
    songList: [],
    currentSongIndex: 0,
    players: [],
  };
};

export const smartRatio = (answer, messageContent) => {
  if (answer.length <= messageContent.length) {
    return fuzz.partial_ratio(answer, messageContent);
  } else {
    return fuzz.ratio(answer, messageContent);
  }
};

export const formatSongName = (name) => {
  return typeof name === "string" ? name : `${name.artist} - ${name.title}`;
};

export const goToNextSong = async (client, channel, skip = false) => {
  client.game = {
    ...client.game,
    wait: true,
    currentSongIndex: client.game.currentSongIndex + 1,
  };
  if (!skip) {
    await wait(10000);
  }
  // check if game is over
  if (client.game.currentSongIndex === client.game.songList.length) {
    channel.send(`Partie terminée`);
    client.game.streamer.destroy();
    channel.send(getScoreboard(client.game.players));
  } else {
    channel.send(`Chanson suivante`);
    client.game.streamer.destroy();
    await wait(2000);
    const streamer = playUrl(
      client.game.songList[client.game.currentSongIndex].url,
      client.game.voiceConnection
    );
    streamer.on("error", () => {
      channel.send(
        `Une erreur sur cette chanson : ${formatSongName(
          client.game.songList[client.game.currentSongIndex].name
        )}`
      );
      goToNextSong(client, channel, skip);
    });
    client.game = {
      ...client.game,
      streamer,
      wait: false,
      goToNextSong: false,
      artistFound: false,
      titleFound: false,
    };
  }
};

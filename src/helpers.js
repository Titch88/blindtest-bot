import ytdl from "ytdl-core";
import ytpl from "ytpl";
import getArtistTitle from "get-artist-title";
import fuzz from "fuzzball";

const isCommand = content => content[0] === "!";

// building the playlist object
const buildPlaylist = async youtubeUrl => {
  const playlist = await ytpl(youtubeUrl);
  const result = playlist.items.map(({ title, shortUrl }) => {
    const extracted = getArtistTitle(title.replace(/\([^()]*\)/g, ""), {
      defaultArtist: "",
      defaultTitle: ""
    });
    const name = extracted
      ? {
          artist: extracted[0],
          title: extracted[1]
        }
      : title;
    return {
      name,
      url: shortUrl
    };
  });
  return result;
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const playUrl = (url, connection) =>
  connection.play(ytdl(url, { filter: "audioonly" }));

const getScoreboard = players => {
  return Object.entries(players)
    .sort((a, b) => a[0] < b[0])
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

const resetState = client => {
  if (client.game.voiceConnection) client.game.voiceConnection.disconnect();
  client.game = {
    currentlyPlaying: false,
    voiceChannel: null,
    voiceConnection: null,
    textChannel: null,
    songList: [],
    currentSongIndex: 0,
    players: []
  };
};

const smartRatio = (answer, messageContent) => {
  if (answer.length <= messageContent) {
    return fuzz.partial_ratio(answer, messageContent);
  } else {
    return fuzz.ratio(answer, messageContent);
  }
};

export {
  isCommand,
  buildPlaylist,
  wait,
  playUrl,
  getScoreboard,
  resetState,
  smartRatio
};

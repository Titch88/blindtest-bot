import ytdl from "ytdl-core";
import ytpl from "ytpl";
import getArtistTitle from "get-artist-title";

const isCommand = content => content[0] === "!";

// building the playlist object
const buildPlaylist = async youtubeUrl => {
  const playlist = await ytpl(youtubeUrl);
  const result = playlist.items.map(({ title, shortUrl }) => {
    const extracted = getArtistTitle(title, {
      defaultArtist: "",
      defaultTitle: ""
    });
    const name = extracted ? `${extracted[0]} - ${extracted[1]}` : title;
    return {
      name: name.replace(/\([^()]*\)/g, ""), // remove things in parenthesis
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

export { isCommand, buildPlaylist, wait, playUrl, getScoreboard, resetState };

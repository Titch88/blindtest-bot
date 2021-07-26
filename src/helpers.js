import ytdl from "ytdl-core";
import ytpl from "ytpl";
import getArtistTitle from "get-artist-title";
import fuzz from "fuzzball";

export const isCommand = content => content[0] === "!";

// building the playlist object
export const buildPlaylist = async youtubeUrl => {
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

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

export const playUrl = (url, connection) =>
  connection.play(ytdl(url, { filter: "audioonly" }));

export const getScoreboard = players => {
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

export const resetState = client => {
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

export const smartRatio = (answer, messageContent) => {
  if (answer.length <= messageContent.length) {
    return fuzz.partial_ratio(answer, messageContent);
  } else {
    return fuzz.ratio(answer, messageContent);
  }
};

export const goToNextSong = async (client, channel) => {
  client.game = {
    ...client.game,
    currentSongIndex: client.game.currentSongIndex + 1
  };
  await wait(10000);
  // check if game is over
  if (client.game.currentSongIndex === client.game.songList.length) {
    channel.send(`Partie terminée`);
    client.game.streamer.destroy();
    channel.send(getScoreboard(client.game.players));
  } else {
    channel.send(`Chanson suivante`);
    client.game.streamer.destroy();
    await wait(2000);
    client.game = {
      ...client.game,
      streamer: playUrl(
        client.game.songList[client.game.currentSongIndex].url,
        client.game.voiceConnection
      ),
      goToNextSong: false,
      artistFound: false,
      titleFound: false
    };
  }
};
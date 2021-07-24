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
      return `${acc}${nick} - ${score}\n`;
    }, "");
};

export { isCommand, buildPlaylist, wait, playUrl, getScoreboard };

import ytdl from "ytdl-core";
import ytpl from "ytpl";
const isCommand = content => content[0] === "!";

// building the playlist object
const buildPlaylist = async youtubeUrl => {
  const playlist = await ytpl(youtubeUrl);
  return playlist.items.map(({ title, shortUrl }) => ({
    name: title,
    url: shortUrl
  }));
};

export { isCommand, buildPlaylist };

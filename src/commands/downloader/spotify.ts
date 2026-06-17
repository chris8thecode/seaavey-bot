import { createDownloader } from "./createDownloader";

export default createDownloader({
  name: "Spotify",
  aliases: ["spot", "spotify"],
  description: "Download lagu dari Spotify",
  platform: "Spotify",
  helpExample: "https://open.spotify.com/track/...",
  endpoint: "/downloader/spotify",
  mediaType: "audio",
});

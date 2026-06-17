import { createDownloader } from "./createDownloader";

export default createDownloader({
  name: "SoundCloud DL",
  aliases: ["soundclouddl"],
  description: "Download lagu dari SoundCloud",
  platform: "SoundCloud",
  helpExample: "https://soundcloud.com/...",
  endpoint: "/downloader/soundcloud",
  mediaType: "audio",
});

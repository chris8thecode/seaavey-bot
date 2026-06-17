import { createDownloader } from "./createDownloader";

export default createDownloader({
  name: "YT MP3",
  aliases: ["ytmp3"],
  description: "Download audio dari YouTube",
  platform: "YouTube",
  helpExample: "https://youtu.be/...",
  endpoint: "/downloader/youtube/audio",
  mediaType: "audio",
  progressText: "⏳ Downloading audio...",
});

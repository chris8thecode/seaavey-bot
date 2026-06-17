import { createDownloader } from "./createDownloader";

export default createDownloader({
  name: "YT MP4",
  aliases: ["ytmp4"],
  description: "Download video dari YouTube",
  platform: "YouTube",
  helpExample: "https://youtu.be/...",
  endpoint: "/downloader/youtube/video",
  mediaType: "video",
  progressText: "⏳ Downloading video...",
});

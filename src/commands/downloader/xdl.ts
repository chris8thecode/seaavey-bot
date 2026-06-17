import { createDownloader } from "./createDownloader";

export default createDownloader({
  name: "X (Twitter) DL",
  aliases: ["xdl", "x(twitter)dl"],
  description: "Download media dari X/Twitter",
  platform: "X/Twitter",
  helpExample: "https://x.com/...",
  endpoint: "/downloader/x",
  mediaType: "video",
});

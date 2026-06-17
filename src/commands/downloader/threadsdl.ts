import { createDownloader } from "./createDownloader";

export default createDownloader({
  name: "Threads DL",
  aliases: ["tdl", "threadsdl"],
  description: "Download media dari Threads",
  platform: "Threads",
  helpExample: "https://threads.net/...",
  endpoint: "/downloader/threads",
  mediaType: "video",
});
